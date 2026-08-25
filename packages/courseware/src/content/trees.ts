import {
  audio,
  codeTrace,
  diagram,
  lab,
  lesson,
  project,
  quiz,
  reflection,
  simulation,
  text,
  type CourseLesson
} from "../index";

export const treesLessons: CourseLesson[] = [
  lesson(
    "bst-insert",
    "Binary Search Tree: Insert & Search",
    "Keep values ordered by walking left for smaller and right for larger, then insert or search at the empty spot.",
    [
      "Explain how insert preserves BST ordering",
      "Trace a search from the root"
    ],
    [
      text("bst-insert-read", "What it does", [
        "A BST node stores a value plus left and right children.",
        "To insert, start at the root and go left when the value is smaller, right when larger, until you reach an empty child.",
        "To search, follow the same rule and stop when the value matches or a null child is reached.",
        "Search and insert both take time proportional to the tree height."
      ]),
      codeTrace(
        "bst-insert-trace",
        "BST insert and search",
        `class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(value: number) { this.value = value; }
}
class BST {
  root: TreeNode | null = null;
  insert(value: number): void {
    const node = new TreeNode(value);
    if (!this.root) { this.root = node; return; }
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = node; break; }
        current = current.left;
      } else {
        if (!current.right) { current.right = node; break; }
        current = current.right;
      }
    }
  }
  search(value: number): boolean {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }
}`,
        [
          "Create the new node",
          "If the tree is empty, make it the root",
          "Go left when the value is smaller",
          "Go right when the value is larger or equal",
          "Stop at the empty child and attach the node"
        ]
      ),
      quiz(
        "bst-insert-check",
        "What is the time complexity of BST search in a balanced tree?",
        "opt-logn",
        undefined,
        {
          options: [
            { id: "opt-logn", label: "O(log n) by height" },
            { id: "opt-n", label: "O(n) always" },
            { id: "opt-1", label: "O(1) direct" }
          ],
          feedback: "Right. In a balanced tree the height is about log n, so each step halves the remaining subtree.",
          incorrectFeedback: "Not yet. Cost follows the tree height, not the node count directly."
        }
      ),
      reflection(
        "bst-insert-reflection",
        "Why can a BST's search degrade toward O(n), and what fixes it?"
      )
    ]
  ),
  lesson(
    "tree-traversals",
    "Tree Traversals",
    "Visit nodes in different orders to answer different questions about a tree.",
    [
      "Name the four traversal orders",
      "Say what inorder produces for a BST"
    ],
    [
      text("tree-traversals-read", "What it does", [
        "Inorder visits left, then root, then right; for a BST this yields sorted order.",
        "Preorder visits root first, useful for copying a tree's structure.",
        "Postorder visits children before the root, useful for deleting a tree.",
        "Level order visits by distance from the root using a queue (breadth-first)."
      ]),
      codeTrace(
        "tree-traversals-trace",
        "Traversal implementations",
        `function inorder(root: TreeNode | null, out: number[] = []): number[] {
  if (root) { inorder(root.left, out); out.push(root.value); inorder(root.right, out); }
  return out;
}
function preorder(root: TreeNode | null, out: number[] = []): number[] {
  if (root) { out.push(root.value); preorder(root.left, out); preorder(root.right, out); }
  return out;
}
function postorder(root: TreeNode | null, out: number[] = []): number[] {
  if (root) { postorder(root.left, out); postorder(root.right, out); out.push(root.value); }
  return out;
}
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  while (queue.length) {
    const size = queue.length;
    const level: number[] = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      level.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
        [
          "Inorder: left, root, right",
          "Preorder: root, left, right",
          "Postorder: left, right, root",
          "Level order uses a queue per depth",
          "Each order answers a different question"
        ]
      ),
      quiz(
        "tree-traversals-check",
        "Which traversal prints a BST's values in sorted order?",
        "opt-inorder",
        undefined,
        {
          options: [
            { id: "opt-inorder", label: "Inorder (left, root, right)" },
            { id: "opt-pre", label: "Preorder (root, left, right)" },
            { id: "opt-post", label: "Postorder (left, right, root)" }
          ],
          feedback: "Right. Visiting left then root then right walks a BST in ascending order.",
          incorrectFeedback: "Not yet. Which order respects the BST ordering rule?"
        }
      ),
      reflection(
        "tree-traversals-reflection",
        "Which traversal would you use to serialize a tree so it can be rebuilt exactly?"
      )
    ]
  )
];
