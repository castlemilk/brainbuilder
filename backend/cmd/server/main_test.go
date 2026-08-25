package main

import "testing"

func TestServerAddr(t *testing.T) {
	t.Parallel()

	tests := map[string]struct {
		env  string
		want string
	}{
		"default": {want: ":8080"},
		"custom":  {env: "127.0.0.1:9090", want: "127.0.0.1:9090"},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			got := serverAddr(func(key string) string {
				if key == "BRAINBUILDER_ADDR" {
					return tc.env
				}
				return ""
			})
			if got != tc.want {
				t.Fatalf("serverAddr() = %q, want %q", got, tc.want)
			}
		})
	}
}
