// Smart translator for DSA pseudocode / JavaScript code to C++ and Java.
// Maintains line-for-line correspondence so that active step-by-step
// line highlighting is 100% accurate.

export type DSALanguage = "javascript" | "java" | "cpp";

// Overrides for algorithms where automatic rule translation is complex
const TRANSLATION_OVERRIDES: Record<string, { cpp: string[]; java: string[] }> = {
  "ll-traverse": {
    cpp: [
      "void traverse(Node* head) {",
      "  Node* curr = head;",
      "  while (curr != nullptr) {",
      "    print(curr->value);",
      "    curr = curr->next;",
      "  }",
      "}",
    ],
    java: [
      "public void traverse(Node head) {",
      "  Node curr = head;",
      "  while (curr != null) {",
      "    System.out.println(curr.value);",
      "    curr = curr.next;",
      "  }",
      "}",
    ],
  },
  "ll-insert-front": {
    cpp: [
      "Node* insertFront(Node* head, int val) {",
      "  Node* newNode = new Node(val);",
      "  newNode->next = head;",
      "  head = newNode;",
      "  return head;",
      "}",
    ],
    java: [
      "public Node insertFront(Node head, int val) {",
      "  Node newNode = new Node(val);",
      "  newNode.next = head;",
      "  head = newNode;",
      "  return head;",
      "}",
    ],
  },
  "ll-insert-end": {
    cpp: [
      "Node* insertEnd(Node* head, int val) {",
      "  Node* newNode = new Node(val);",
      "  if (head == nullptr) return newNode;",
      "  Node* curr = head;",
      "  while (curr->next != nullptr) {",
      "    curr = curr->next;",
      "  }",
      "  curr->next = newNode;",
      "  return head;",
      "}",
    ],
    java: [
      "public Node insertEnd(Node head, int val) {",
      "  Node newNode = new Node(val);",
      "  if (head == null) return newNode;",
      "  Node curr = head;",
      "  while (curr.next != null) {",
      "    curr = curr.next;",
      "  }",
      "  curr.next = newNode;",
      "  return head;",
      "}",
    ],
  },
  "ll-delete": {
    cpp: [
      "Node* deleteNode(Node* head, int val) {",
      "  if (head == nullptr) return nullptr;",
      "  if (head->value == val) return head->next;",
      "  Node* curr = head;",
      "  while (curr->next != nullptr && curr->next->value != val) {",
      "    curr = curr->next;",
      "  }",
      "  if (curr->next != nullptr) curr->next = curr->next->next;",
      "  return head;",
      "}",
    ],
    java: [
      "public Node deleteNode(Node head, int val) {",
      "  if (head == null) return null;",
      "  if (head.value == val) return head.next;",
      "  Node curr = head;",
      "  while (curr.next != null && curr.next.value != val) {",
      "    curr = curr.next;",
      "  }",
      "  if (curr.next != null) curr.next = curr.next.next;",
      "  return head;",
      "}",
    ],
  },
  "ll-reverse": {
    cpp: [
      "Node* reverse(Node* head) {",
      "  Node *prev = nullptr, *curr = head, *nxt = nullptr;",
      "  while (curr != nullptr) {",
      "    nxt = curr->next;",
      "    curr->next = prev;",
      "    prev = curr;",
      "    curr = nxt;",
      "  }",
      "  return prev;",
      "}",
    ],
    java: [
      "public Node reverse(Node head) {",
      "  Node prev = null, curr = head, nxt = null;",
      "  while (curr != null) {",
      "    nxt = curr.next;",
      "    curr.next = prev;",
      "    prev = curr;",
      "    curr = nxt;",
      "  }",
      "  return prev;",
      "}",
    ],
  },
  "tree-inorder": {
    cpp: [
      "void inorder(TreeNode* root) {",
      "  if (root == nullptr) return;",
      "  inorder(root->left);",
      "  print(root->val);",
      "  inorder(root->right);",
      "}",
    ],
    java: [
      "public void inorder(TreeNode root) {",
      "  if (root == null) return;",
      "  inorder(root.left);",
      "  System.out.println(root.val);",
      "  inorder(root.right);",
      "}",
    ],
  },
  "tree-preorder": {
    cpp: [
      "void preorder(TreeNode* root) {",
      "  if (root == nullptr) return;",
      "  print(root->val);",
      "  preorder(root->left);",
      "  preorder(root->right);",
      "}",
    ],
    java: [
      "public void preorder(TreeNode root) {",
      "  if (root == null) return;",
      "  System.out.println(root.val);",
      "  preorder(root.left);",
      "  preorder(root.right);",
      "}",
    ],
  },
  "tree-postorder": {
    cpp: [
      "void postorder(TreeNode* root) {",
      "  if (root == nullptr) return;",
      "  postorder(root->left);",
      "  postorder(root->right);",
      "  print(root->val);",
      "}",
    ],
    java: [
      "public void postorder(TreeNode root) {",
      "  if (root == null) return;",
      "  postorder(root.left);",
      "  postorder(root.right);",
      "  System.out.println(root.val);",
      "}",
    ],
  },
  "tree-levelorder": {
    cpp: [
      "void levelOrder(TreeNode* root) {",
      "  if (root == nullptr) return;",
      "  queue<TreeNode*> q;",
      "  q.push(root);",
      "  while (!q.empty()) {",
      "    TreeNode* curr = q.front(); q.pop();",
      "    print(curr->val);",
      "    if (curr->left) q.push(curr->left);",
      "    if (curr->right) q.push(curr->right);",
      "  }",
      "}",
    ],
    java: [
      "public void levelOrder(TreeNode root) {",
      "  if (root == null) return;",
      "  Queue<TreeNode> q = new LinkedList<>();",
      "  q.offer(root);",
      "  while (!q.isEmpty()) {",
      "    TreeNode curr = q.poll();",
      "    System.out.println(curr.val);",
      "    if (curr.left != null) q.offer(curr.left);",
      "    if (curr.right != null) q.offer(curr.right);",
      "  }",
      "}",
    ],
  },
  "tree-insert-bst": {
    cpp: [
      "TreeNode* insert(TreeNode* root, int val) {",
      "  if (root == nullptr) return new TreeNode(val);",
      "  if (val < root->val) {",
      "    root->left = insert(root->left, val);",
      "  } else {",
      "    root->right = insert(root->right, val);",
      "  }",
      "  return root;",
      "}",
    ],
    java: [
      "public TreeNode insert(TreeNode root, int val) {",
      "  if (root == null) return new TreeNode(val);",
      "  if (val < root.val) {",
      "    root.left = insert(root.left, val);",
      "  } else {",
      "    root.right = insert(root.right, val);",
      "  }",
      "  return root;",
      "}",
    ],
  },
};

export function translateCode(algoId: string, jsLines: string[], lang: DSALanguage): string[] {
  if (lang === "javascript") {
    return jsLines;
  }

  // Check manual overrides first
  if (TRANSLATION_OVERRIDES[algoId]?.[lang]) {
    return TRANSLATION_OVERRIDES[algoId][lang];
  }

  // Fallback to rule-based line translation
  return jsLines.map((line) => {
    let l = line;
    if (lang === "cpp") {
      // Function header translation rules
      l = l.replace(/function\s+(\w+)\s*\((.*?)\)\s*\{/, (match, fname, args) => {
        let returnType = "void";
        if (
          fname.includes("Search") ||
          fname.includes("max") ||
          fname.includes("find") ||
          fname.includes("get") ||
          fname.includes("peek")
        ) {
          returnType = "int";
        }
        const mappedArgs = args
          .split(",")
          .map((arg: string) => {
            const a = arg.trim();
            if (!a) return "";
            if (a === "arr") return "vector<int>& arr";
            if (a === "s") return "string s";
            return `int ${a}`;
          })
          .filter(Boolean)
          .join(", ");
        return `${returnType} ${fname}(${mappedArgs}) {`;
      });

      // Simple swaps
      l = l.replace(
        /\[arr\[(\w+)\], arr\[(\w+)\]\] = \[arr\[\2\], arr\[\1\]\];?/,
        "swap(arr[$1], arr[$2]);",
      );

      // Math functions
      l = l.replace(/Math\.max/g, "max");
      l = l.replace(/Math\.min/g, "min");
      l = l.replace(/Math\.abs/g, "abs");
      l = l.replace(/Math\.floor\((.*?)\)/g, "(int)($1)");

      // Array size/length
      l = l.replace(/\.length/g, ".size()");

      // let variables declarations
      l = l.replace(/let\s+/, "int ");
      l = l.replace(/const\s+/, "const int ");

      // push / pop / shift/ unshift wrappers
      l = l.replace(/(\w+)\.push\((.*?)\)/g, "$1.push($2)");
      l = l.replace(/(\w+)\.pop\(\)/g, "$1.pop()");

      // return statements
      l = l.replace(/return\s+arr;?/, "return;");
    } else if (lang === "java") {
      // Function header translation rules
      l = l.replace(/function\s+(\w+)\s*\((.*?)\)\s*\{/, (match, fname, args) => {
        let returnType = "void";
        if (
          fname.includes("Search") ||
          fname.includes("max") ||
          fname.includes("find") ||
          fname.includes("get") ||
          fname.includes("peek")
        ) {
          returnType = "int";
        } else if (fname.includes("reverse") && args.includes("arr")) {
          returnType = "void";
        }
        const mappedArgs = args
          .split(",")
          .map((arg: string) => {
            const a = arg.trim();
            if (!a) return "";
            if (a === "arr") return "int[] arr";
            if (a === "s") return "String s";
            return `int ${a}`;
          })
          .filter(Boolean)
          .join(", ");
        return `public ${returnType} ${fname}(${mappedArgs}) {`;
      });

      // Swaps
      l = l.replace(
        /\[arr\[(\w+)\], arr\[(\w+)\]\] = \[arr\[\2\], arr\[\1\]\];?/,
        "swap(arr, $1, $2);",
      );

      // Math functions
      l = l.replace(/Math\.max/g, "Math.max");
      l = l.replace(/Math\.min/g, "Math.min");
      l = l.replace(/Math\.abs/g, "Math.abs");
      l = l.replace(/Math\.floor\((.*?)\)/g, "(int)Math.floor($1)");

      // Array size/length
      l = l.replace(/\.length/g, ".length");

      // let variables declarations
      l = l.replace(/let\s+/, "int ");
      l = l.replace(/const\s+/, "final int ");

      // push / pop wrappers
      l = l.replace(/(\w+)\.push\((.*?)\)/g, "$1.push($2)");
      l = l.replace(/(\w+)\.pop\(\)/g, "$1.pop()");

      // return statements
      l = l.replace(/return\s+arr;?/, "return;");
    }

    return l;
  });
}
