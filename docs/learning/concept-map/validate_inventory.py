#!/usr/bin/env python3
"""Validate concept identities, prerequisite DAG and pinned source references.

Python standard library only. No imports of app code, network calls or writes.
Default mode permits checkout changes only when every referenced source span
is still byte-identical and the source lesson/block inventory still matches.
--strict-baseline additionally requires every recorded source-file hash.
This is structural consistency checking, not educational approval.
"""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys


def fail(message):
    raise ValueError(message)


def unique(records, label):
    result = {}
    for record in records:
        identity = record['id']
        if identity in result:
            fail(f'Duplicate {label} ID: {identity}')
        result[identity] = record
    return result


def digest(value):
    return hashlib.sha256(value).hexdigest()


def validate(repo, directory, strict):
    inventory = json.loads((directory/'concepts.json').read_text())
    coverage = json.loads((directory/'source-coverage.json').read_text())
    if inventory['baseline'] != coverage['baseline']:
        fail('Inventory and coverage baseline disagree')
    concepts = unique(inventory['concepts'], 'concept')
    lessons = unique(coverage['lessons'], 'lesson')
    activities = unique(coverage['activities'], 'activity')
    units = unique(coverage['units'], 'unit')
    refs = coverage['source_refs']
    if set(lessons) & set(activities):
        fail('Existing lesson and block IDs collide')
    source_text = {}
    changed_files = []
    for record in coverage['source_files']:
        path = (repo/record['path']).resolve()
        if not path.is_relative_to(repo.resolve()) or not path.is_file():
            fail(f'Missing or out-of-tree source file: {record["path"]}')
        data = path.read_bytes()
        source_text[record['path']] = data.decode('utf-8')
        if digest(data) != record['sha256']:
            changed_files.append(record['path'])
    if strict and changed_files:
        fail('Checkout differs from pinned baseline: '+', '.join(changed_files))

    relocated = []
    for identity, ref in refs.items():
        if ref['path'] not in source_text:
            fail(f'{identity} names an unrecorded source file')
        lines = source_text[ref['path']].splitlines(keepends=True)
        first, last = ref['start_line'], ref['end_line']
        if type(first) is not int or type(last) is not int or not 1 <= first <= last:
            fail(f'{identity} has invalid line bounds')
        expected = ref['span_sha256']
        original = ''.join(lines[first-1:last])
        if digest(original.encode()) == expected and ref['marker'] in original:
            continue
        width = last-first+1
        matches = []
        for start in range(max(0, len(lines)-width+1)):
            candidate = ''.join(lines[start:start+width])
            if ref['marker'] in candidate and digest(candidate.encode()) == expected:
                matches.append((start+1,start+width))
        if len(matches) != 1:
            fail(f'{identity}: referenced source content changed, disappeared or became ambiguous')
        relocated.append({'source_ref':identity,'baseline_lines':[first,last],'checkout_lines':list(matches[0])})

    # Independent discovery from the current literal-helper authoring format.
    # Source-span hashes guard the generated factory/profile implementation.
    discovered_lessons = {}
    discovered_activities = {}
    kinds = {'text':'text','audio':'audio','diagram':'diagram','simulation':'simulation','codeTrace':'code-trace','quiz':'quiz','lab':'lab','reflection':'reflection','project':'project'}
    pattern = re.compile(r'\b(lesson|conceptLesson|'+'|'.join(kinds)+r')\s*\(\s*"([^"\n]+)"')
    for source in coverage['source_files']:
        if source['role'] != 'course_definition':
            continue
        for method, identity in pattern.findall(source_text[source['path']]):
            target = discovered_lessons if method in ('lesson','conceptLesson') else discovered_activities
            if identity in target:
                fail(f'Source contains duplicate literal ID: {identity}')
            target[identity] = (method, source['path'])
            if method == 'conceptLesson':
                for suffix, kind in [('read','text'),('audio','audio'),('map','diagram'),('check','quiz'),('reflection','reflection')]:
                    generated = identity+'-'+suffix
                    if generated in discovered_activities:
                        fail(f'Generated source ID collides: {generated}')
                    discovered_activities[generated] = (kind, source['path'])
    if set(discovered_lessons) != set(lessons):
        fail('Literal source lesson IDs do not match the inventory')
    if set(discovered_activities) != set(activities):
        fail('Literal/generated source block IDs do not match the inventory')

    seen_lessons = []
    seen_blocks = []
    for unit in units.values():
        if unit['source_ref'] not in refs:
            fail(f'{unit["id"]}: missing unit source ref')
        seen_lessons.extend(unit['lesson_ids'])
        for identity in unit['lesson_ids']:
            if identity not in lessons or lessons[identity]['unit_id'] != unit['id']:
                fail(f'{unit["id"]}: invalid lesson membership {identity}')
    if Counter(seen_lessons) != Counter(lessons.keys()):
        fail('Course unit membership is incomplete or duplicated')
    for lesson in lessons.values():
        if lesson['source_ref'] not in refs or lesson['learning_guide_source_ref'] not in refs:
            fail(f'{lesson["id"]}: broken lesson/guide source reference')
        if not lesson['candidate_concept_ids'] or not set(lesson['candidate_concept_ids']) <= set(concepts):
            fail(f'{lesson["id"]}: missing or unknown concept mapping')
        if lesson['construction'] != discovered_lessons[lesson['id']][0]:
            fail(f'{lesson["id"]}: construction kind differs from source')
        seen_blocks.extend(lesson['activity_ids'])
        for identity in lesson['activity_ids']:
            if identity not in activities or activities[identity]['lesson_id'] != lesson['id']:
                fail(f'{lesson["id"]}: invalid block membership {identity}')
    if Counter(seen_blocks) != Counter(activities.keys()):
        fail('Lesson block membership is incomplete or duplicated')
    for activity in activities.values():
        if not activity['source_refs'] or not set(activity['source_refs']) <= set(refs):
            fail(f'{activity["id"]}: broken source references')
        if not activity['candidate_concept_ids'] or not set(activity['candidate_concept_ids']) <= set(concepts):
            fail(f'{activity["id"]}: missing/unknown concept mapping')
        method = discovered_activities[activity['id']][0]
        if activity['kind'] != kinds.get(method, method):
            fail(f'{activity["id"]}: source block kind differs')
        next_block = activity.get('declared_check',{}).get('next_block_id')
        if next_block and (next_block not in activities or activities[next_block]['lesson_id'] != activity['lesson_id']):
            fail(f'{activity["id"]}: invalid next block')

    visiting, visited = set(), set()
    def visit(identity):
        if identity in visiting:
            fail(f'Prerequisite cycle at {identity}')
        if identity in visited:
            return
        visiting.add(identity)
        for dependency in concepts[identity]['prerequisite_ids']:
            if dependency not in concepts:
                fail(f'{identity}: unknown prerequisite {dependency}')
            visit(dependency)
        visiting.remove(identity)
        visited.add(identity)
    for identity, concept in concepts.items():
        if not re.fullmatch(r'bb\.concept\.(foundations|algorithms)\.[a-z0-9]+(?:-[a-z0-9]+)*',identity):
            fail(f'Invalid stable concept identity: {identity}')
        if len(set(concept['prerequisite_ids'])) != len(concept['prerequisite_ids']):
            fail(f'{identity}: repeated prerequisite')
        if not set(concept['source_lesson_ids']) <= set(lessons) or not set(concept['source_activity_ids']) <= set(activities) or not set(concept['source_context_refs']) <= set(refs):
            fail(f'{identity}: broken source binding')
        inverse = {a['id'] for a in activities.values() if identity in a['candidate_concept_ids']}
        if set(concept['source_activity_ids']) != inverse:
            fail(f'{identity}: activity mappings disagree')
        if concept['subject_review']['status'] != 'pending' or concept['subject_review']['approved_by'] is not None:
            fail(f'{identity}: this inventory must not fabricate educational approval')
        visit(identity)
    order = inventory['prerequisite_topological_order']
    if len(order) != len(concepts) or set(order) != set(concepts):
        fail('Topological order is incomplete or duplicated')
    positions = {identity:i for i,identity in enumerate(order)}
    for concept in concepts.values():
        if any(positions[p] >= positions[concept['id']] for p in concept['prerequisite_ids']):
            fail('Topological order violates a prerequisite edge')
    for status, field in [('missing','missing_prerequisite_ids'),('partial','partial_prerequisite_ids')]:
        expected = {c['id'] for c in concepts.values() if c['area']=='foundations' and c['coverage_status']==status}
        if set(inventory[field]) != expected:
            fail(f'{field} is inconsistent')
    jobs = unique(inventory['candidate_jobs'],'candidate job')
    if len(jobs) != 3 or any(j['status'] != 'unvalidated_candidate' for j in jobs.values()):
        fail('The three distinct candidate jobs must remain unvalidated')
    for job in jobs.values():
        if not set(job['content_fit_hypothesis']) <= set(concepts):
            fail('Candidate job refers to an unknown concept')
    drafts = unique(inventory['worked_activity_drafts'],'draft activity')
    for draft in drafts.values():
        if not set(draft['concept_ids']) <= set(concepts) or not set(draft['source_activity_ids']) <= set(activities):
            fail(f'{draft["id"]}: broken worked-example binding')
        if draft['subject_review_status'] != 'pending':
            fail('Worked examples must remain subject-review drafts')

    actual_counts = {'course_count':1,'unit_count':len(units),'lesson_count':len(lessons),'activity_count':len(activities),
      'block_kind_counts':dict(sorted(Counter(a['kind'] for a in activities.values()).items())),
      'declared_assessment_block_count':sum(a['kind'] in ('quiz','lab','project') for a in activities.values()),
      'generated_concept_lesson_count':sum(l['construction']=='conceptLesson' for l in lessons.values()),
      'guide_origin_counts':dict(sorted(Counter(l['learning_guide_origin'] for l in lessons.values()).items()))}
    if actual_counts != coverage['coverage']:
        fail('Coverage counts disagree with records')
    return {'result':'pass_with_checkout_divergence' if changed_files else 'pass',
      'remote_baseline':coverage['baseline']['commit'],'current_checkout_is_identical_to_baseline':not changed_files,
      'changed_source_files':changed_files,'unchanged_content_refs_relocated':len(relocated),
      'coverage':actual_counts,'concepts':len(concepts),'prerequisite_edges':sum(len(c['prerequisite_ids']) for c in concepts.values()),
      'dag':'acyclic','source_refs_verified':len(refs),'missing_dedicated_prerequisites':len(inventory['missing_prerequisite_ids']),
      'partial_foundations':len(inventory['partial_prerequisite_ids']),'worked_activity_drafts':len(drafts),
      'limits':'Structural and source-reference validation only. No human subject review, runtime behavior audit or learning efficacy claim.'}


def main():
    directory = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root',type=Path,default=directory.parents[2])
    parser.add_argument('--strict-baseline',action='store_true')
    args = parser.parse_args()
    try:
        print(json.dumps(validate(args.repo_root.resolve(),directory,args.strict_baseline),indent=2))
    except (ValueError,KeyError,OSError,json.JSONDecodeError) as error:
        print('Inventory validation failed: '+str(error),file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
