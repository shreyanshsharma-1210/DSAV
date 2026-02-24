import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn DSA — DSA Visualizer AI" },
      {
        name: "description",
        content:
          "A detailed visual learning curriculum covering Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, and Searching with multi-language code templates.",
      },
      { property: "og:title", content: "Learn DSA" },
      {
        property: "og:description",
        content:
          "Interactive curriculum with complexity charts and complete JS, C++, and Java implementations.",
      },
    ],
  }),
  component: LearnPage,
});

type CodeTemplates = {
  javascript: string;
  cpp: string;
  java: string;
};

type TopicDetail = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  summary: string;
  theoryParagraphs: string[];
  complexities: {
    operation: string;
    average: string;
    worst: string;
    space: string;
  }[];
  interviewPatterns: string[];
  codeTitle: string;
  codeSnippets: CodeTemplates;
};

const DETAILED_TOPICS: TopicDetail[] = [
  {
    id: "arrays",
    name: "Arrays & Strings",
    tagline: "Contiguous memory blocks for instant random access.",
    icon: "▦",
    summary:
      "Arrays are the most fundamental linear data structure, allocating a fixed-size contiguous chunk of physical memory to store elements of homogenous types.",
    theoryParagraphs: [
      "Because elements are stored contiguously, the computer calculates the memory address of any element using a simple mathematical offset formula: `Address = BaseAddress + Index * ElementSize`. This mathematical mapping gives arrays their legendary O(1) random access capability.",
      "However, this contiguous constraint makes resize, insertion, and deletion costly operations. Inserting an element at the beginning of an array requires shifting all subsequent elements to the right, yielding O(n) time complexity. Deleting an element requires a similar shifting of elements to the left to avoid gaps in memory.",
      "Dynamic Arrays (like ArrayList in Java, std::vector in C++, or normal Arrays in JS) solve the fixed-size limitation by allocating a larger buffer (usually double the size) behind the scenes whenever the array exceeds capacity, copying existing elements over. This process guarantees amortized O(1) insertions at the end.",
    ],
    complexities: [
      { operation: "Access (Index)", average: "O(1)", worst: "O(1)", space: "O(1)" },
      { operation: "Search (Value)", average: "O(n)", worst: "O(n)", space: "O(1)" },
      { operation: "Insertion", average: "O(n)", worst: "O(n)", space: "O(1)" },
      { operation: "Deletion", average: "O(n)", worst: "O(n)", space: "O(1)" },
    ],
    interviewPatterns: [
      "Two Pointers Technique (e.g. Reversing, Container With Most Water)",
      "Sliding Window (e.g. Longest Substring Without Repeating Characters)",
      "Kadane's Algorithm (Maximum Subarray Sum)",
      "Prefix Sum Arrays (Range Sum Queries)",
    ],
    codeTitle: "Dynamic Insertion and Resizing Example",
    codeSnippets: {
      javascript: `// JavaScript Arrays are dynamic by default
function insertAt(arr, index, val) {
  // Shift elements to the right manually to demonstrate the O(n) operation
  for (let i = arr.length; i > index; i--) {
    arr[i] = arr[i - 1];
  }
  arr[index] = val;
  return arr;
}

const arr = [10, 20, 30, 40];
console.log("Before:", arr);
insertAt(arr, 1, 99);
console.log("After inserting 99 at index 1:", arr);`,
      cpp: `// C++ std::vector handles dynamic allocation and resizing
#include <iostream>
#include <vector>

void insertAt(std::vector<int>& vec, int index, int val) {
    // Vector insert shifts trailing elements automatically
    // Time complexity: O(N)
    if (index >= 0 && index <= vec.size()) {
        vec.insert(vec.begin() + index, val);
    }
}

int main() {
    std::vector<int> vec = {10, 20, 30, 40};
    insertAt(vec, 1, 99);
    
    std::cout << "After insertion: ";
    for (int num : vec) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
      java: `// Java ArrayList implements dynamic arrays
import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> list = new ArrayList<>(Arrays.asList(10, 20, 30, 40));
        
        // Inserts 99 at index 1, shifting elements automatically (O(N))
        list.add(1, 99);
        
        System.out.println("After insertion: " + list);
    }
}`,
    },
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    tagline: "Dynamically allocated nodes connected via pointer addresses.",
    icon: "→",
    summary:
      "A linked list is a linear collection of data elements called nodes, whose physical order is not given by their placement in memory. Instead, each node points to the next.",
    theoryParagraphs: [
      "In contrast to arrays, linked list nodes do not require contiguous memory blocks. Nodes are allocated on the heap dynamically, connected via references. This layout makes inserting or deleting nodes exceptionally efficient (O(1) time complexity) because it only requires updating a couple of pointer references rather than shifting elements.",
      "The major drawback is the lack of random access. To find the N-th node or search for a value, you must walk the list sequentially from the head node, making index access an O(n) operation. Additionally, linked lists incur a memory overhead because each node must store the address pointer(s) along with the data value.",
      "Common variants include Singly Linked Lists (one-way pointers), Doubly Linked Lists (pointers to next and previous nodes), and Circular Linked Lists (tail node points back to the head node).",
    ],
    complexities: [
      { operation: "Access", average: "O(n)", worst: "O(n)", space: "O(1)" },
      { operation: "Search", average: "O(n)", worst: "O(n)", space: "O(1)" },
      { operation: "Insertion", average: "O(1)", worst: "O(1)", space: "O(1)" },
      { operation: "Deletion", average: "O(1)", worst: "O(1)", space: "O(1)" },
    ],
    interviewPatterns: [
      "Fast & Slow Pointers / Hare & Tortoise (e.g. Cycle Detection, Middle Node)",
      "Reverse Linked List (Iterative & Recursive)",
      "Dummy Node Technique (e.g. Merge Two Sorted Lists)",
      "Two Pointers Offset (e.g. Remove N-th Node from End)",
    ],
    codeTitle: "Singly Linked List Implementation",
    codeSnippets: {
      javascript: `class Node {
  constructor(val) {
    this.value = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertAtHead(val) {
    const newNode = new Node(val);
    newNode.next = this.head;
    this.head = newNode;
  }

  printList() {
    let curr = this.head;
    let path = [];
    while (curr) {
      path.push(curr.value);
      curr = curr.next;
    }
    console.log(path.join(" -> ") + " -> null");
  }
}

const list = new LinkedList();
list.insertAtHead(30);
list.insertAtHead(20);
list.insertAtHead(10);
list.printList();`,
      cpp: `#include <iostream>

struct Node {
    int value;
    Node* next;
    Node(int val) : value(val), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;
public:
    LinkedList() : head(nullptr) {}

    void insertAtHead(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }

    void printList() {
        Node* curr = head;
        while (curr != nullptr) {
            std::cout << curr->value << " -> ";
            curr = curr->next;
        }
        std::cout << "nullptr" << std::endl;
    }
};

int main() {
    LinkedList list;
    list.insertAtHead(30);
    list.insertAtHead(20);
    list.insertAtHead(10);
    list.printList();
    return 0;
}`,
      java: `public class Main {
    static class Node {
        int value;
        Node next;
        Node(int val) {
            this.value = val;
            this.next = null;
        }
    }

    static class LinkedList {
        Node head = null;

        void insertAtHead(int val) {
            Node newNode = new Node(val);
            newNode.next = head;
            head = newNode;
        }

        void printList() {
            Node curr = head;
            while (curr != null) {
                System.out.print(curr.value + " -> ");
                curr = curr.next;
            }
            System.out.println("null");
        }
    }

    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        list.insertAtHead(30);
        list.insertAtHead(20);
        list.insertAtHead(10);
        list.printList();
    }
}`,
    },
  },
  {
    id: "trees",
    name: "Trees & BSTs",
    tagline: "Hierarchical parent-child nodes optimizing lookups.",
    icon: "⋎",
    summary:
      "A tree is a non-linear hierarchical data structure consisting of nodes connected by directed edges, with a single node designated as root.",
    theoryParagraphs: [
      "Trees represent hierarchical relationships rather than linear sequences. A Binary Tree restricts each node to a maximum of two children (conventionally labeled Left and Right).",
      "A Binary Search Tree (BST) adds an ordering rule: for every node, all values in its left subtree must be less than the node's value, and all values in its right subtree must be greater. When a BST is balanced (e.g. AVL or Red-Black Trees), search, insertion, and deletion can be completed in logarithmic O(log n) time by discarding half the subtree path at each node evaluation.",
      "If a BST becomes unbalanced (skewed in a straight line like a linked list), operations degrade to linear O(n) complexity. Key traversal algorithms include Inorder (Left, Root, Right), Preorder (Root, Left, Right), Postorder (Left, Right, Root), and Level Order (Breadth-First).",
    ],
    complexities: [
      { operation: "Search (Balanced)", average: "O(log n)", worst: "O(log n)", space: "O(h)" },
      { operation: "Search (Skewed)", average: "O(n)", worst: "O(n)", space: "O(n)" },
      { operation: "Insertion", average: "O(log n)", worst: "O(n)", space: "O(h)" },
      { operation: "Deletion", average: "O(log n)", worst: "O(n)", space: "O(h)" },
    ],
    interviewPatterns: [
      "Depth-First Search recursion (Preorder, Inorder, Postorder)",
      "Breadth-First Search queue (Level Order traversal)",
      "Subtree analysis (e.g. Find Max Depth, Check Balanced, LCA)",
      "Binary Search Tree construction and node deletions",
    ],
    codeTitle: "BST Node Insertion and Inorder Traversal",
    codeSnippets: {
      javascript: `class TreeNode {
  constructor(val) {
    this.value = val;
    this.left = null;
    this.right = null;
  }
}

function insertBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.value) {
    root.left = insertBST(root.left, val);
  } else {
    root.right = insertBST(root.right, val);
  }
  return root;
}

function inorder(root) {
  if (root) {
    inorder(root.left);
    console.log(root.value);
    inorder(root.right);
  }
}

let root = null;
root = insertBST(root, 50);
root = insertBST(root, 30);
root = insertBST(root, 70);
console.log("Inorder Traversal:");
inorder(root);`,
      cpp: `#include <iostream>

struct TreeNode {
    int value;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val) : value(val), left(nullptr), right(nullptr) {}
};

TreeNode* insertBST(TreeNode* root, int val) {
    if (root == nullptr) return new TreeNode(val);
    if (val < root->value) {
        root->left = insertBST(root->left, val);
    } else {
        root->right = insertBST(root->right, val);
    }
    return root;
}

void inorder(TreeNode* root) {
    if (root != nullptr) {
        inorder(root->left);
        std::cout << root->value << " ";
        inorder(root->right);
    }
}

int main() {
    TreeNode* root = nullptr;
    root = insertBST(root, 50);
    root = insertBST(root, 30);
    root = insertBST(root, 70);
    
    std::cout << "Inorder Traversal: ";
    inorder(root);
    std::cout << std::endl;
    return 0;
}`,
      java: `public class Main {
    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int val) {
            value = val;
            left = right = null;
        }
    }

    public static TreeNode insertBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.value) {
            root.left = insertBST(root.left, val);
        } else {
            root.right = insertBST(root.right, val);
        }
        return root;
    }

    public static void inorder(TreeNode root) {
        if (root != null) {
            inorder(root.left);
            System.out.print(root.value + " ");
            inorder(root.right);
        }
    }

    public static void main(String[] args) {
        TreeNode root = null;
        root = insertBST(root, 50);
        root = insertBST(root, 30);
        root = insertBST(root, 70);
        System.out.print("Inorder: ");
        inorder(root);
        System.out.println();
    }
}`,
    },
  },
  {
    id: "graphs",
    name: "Graphs & Networks",
    tagline: "Nodes and connecting edges forming arbitrary networks.",
    icon: "◌",
    summary:
      "A graph is a network structures composed of vertices (nodes) linked by edges, representing relationships without hierarchical roots.",
    theoryParagraphs: [
      "Graphs can model almost any network: social networks, road layouts, routing packets, or dependency charts. They can be Directed (one-way relationships) or Undirected (two-way relationships). Edges can also be Weighted (representing cost, distance, or bandwidth).",
      "Two standard representations are the Adjacency List (an array of lists mapping nodes to neighbors, best for sparse graphs) and the Adjacency Matrix (a 2D binary grid, best for dense graphs where edge lookups need to be O(1)).",
      "The two primary search methods are Breadth-First Search (BFS) which uses a FIFO Queue to search layer-by-layer and find the shortest path in unweighted graphs, and Depth-First Search (DFS) which uses a LIFO Stack or recursion to plunge as deep as possible first.",
    ],
    complexities: [
      { operation: "BFS Traversal", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
      { operation: "DFS Traversal", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
      { operation: "Edge Lookup (Matrix)", average: "O(1)", worst: "O(1)", space: "O(V²)" },
      { operation: "Edge Lookup (List)", average: "O(deg(V))", worst: "O(V)", space: "O(V + E)" },
    ],
    interviewPatterns: [
      "BFS for shortest path on unweighted graphs",
      "DFS for finding cycles or connected components",
      "Topological Sorting (e.g. Course Schedule dependency problems)",
      "Dijkstra's Algorithm (Shortest path on weighted graphs)",
    ],
    codeTitle: "BFS Adjacency List Traversal",
    codeSnippets: {
      javascript: `class Graph {
  constructor() {
    this.adjList = new Map();
  }

  addVertex(v) {
    if (!this.adjList.has(v)) this.adjList.set(v, []);
  }

  addEdge(v, w) {
    this.adjList.get(v).push(w);
    this.adjList.get(w).push(v); // Undirected
  }

  bfs(start) {
    let visited = new Set();
    let queue = [start];
    visited.add(start);

    let result = [];
    while (queue.length > 0) {
      let curr = queue.shift();
      result.push(curr);

      for (let neighbor of this.adjList.get(curr) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    console.log("BFS Visit sequence:", result.join(" -> "));
  }
}

const g = new Graph();
g.addVertex("A"); g.addVertex("B"); g.addVertex("C");
g.addEdge("A", "B"); g.addEdge("B", "C");
g.bfs("A");`,
      cpp: `#include <iostream>
#include <vector>
#include <map>
#include <queue>
#include <set>

class Graph {
    std::map<char, std::vector<char>> adjList;
public:
    void addEdge(char v, char w) {
        adjList[v].push_back(w);
        adjList[w].push_back(v); // Undirected
    }

    void bfs(char start) {
        std::set<char> visited;
        std::queue<char> q;
        
        visited.insert(start);
        q.push(start);
        
        std::cout << "BFS Sequence: ";
        while (!q.empty()) {
            char curr = q.front();
            q.pop();
            std::cout << curr << " ";
            
            for (char neighbor : adjList[curr]) {
                if (visited.find(neighbor) == visited.end()) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }
        std::cout << std::endl;
    }
};

int main() {
    Graph g;
    g.addEdge('A', 'B');
    g.addEdge('B', 'C');
    g.bfs('A');
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static class Graph {
        private Map<Character, List<Character>> adjList = new HashMap<>();

        void addEdge(char v, char w) {
            adjList.computeIfAbsent(v, k -> new ArrayList<>()).add(w);
            adjList.computeIfAbsent(w, k -> new ArrayList<>()).add(v);
        }

        void bfs(char start) {
            Set<Character> visited = new HashSet<>();
            Queue<Character> queue = new LinkedList<>();

            visited.add(start);
            queue.add(start);

            System.out.print("BFS Sequence: ");
            while (!queue.isEmpty()) {
                char curr = queue.poll();
                System.out.print(curr + " ");

                for (char neighbor : adjList.getOrDefault(curr, new ArrayList<>())) {
                    if (!visited.contains(neighbor)) {
                        visited.add(neighbor);
                        queue.add(neighbor);
                    }
                }
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        Graph g = new Graph();
        g.addEdge('A', 'B');
        g.addEdge('B', 'C');
        g.bfs('A');
    }
}`,
    },
  },
  {
    id: "sorting",
    name: "Sorting Algorithms",
    tagline: "Algorithms arranging linear vectors in ascending or descending sequence.",
    icon: "↕",
    summary:
      "Sorting organizes a disordered array of values into a structured, monotonically increasing or decreasing collection.",
    theoryParagraphs: [
      "Different sorting algorithms possess distinct structural trade-offs in time, space, and stability. Quadratic sorts (Bubble, Selection, Insertion) are conceptually simple and execute in O(n²) time. They are generally only practical for educational purposes or extremely small arrays.",
      "Divide-and-conquer sorts, such as Merge Sort and Quick Sort, achieve optimal O(n log n) running times. Merge Sort divides the array in half recursively, sorts them, and merges them back using an auxiliary array, guaranteeing O(n log n) time but costing O(n) extra space.",
      "Quick Sort sorts in-place by partitioning the array around a pivot element. Average case is O(n log n) with excellent cache performance, though a poor choice of pivot on a sorted array can degrade it to O(n²).",
    ],
    complexities: [
      { operation: "Quick Sort", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
      { operation: "Merge Sort", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
      { operation: "Insertion Sort", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
      { operation: "Bubble Sort", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    ],
    interviewPatterns: [
      "In-place partitioning techniques",
      "Stable vs Unstable sorting conditions",
      "Divide & Conquer recursion patterns",
      "K-th Largest Element search optimization",
    ],
    codeTitle: "Quick Sort Implementation",
    codeSnippets: {
      javascript: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo < hi) {
    let pIdx = partition(arr, lo, hi);
    quickSort(arr, lo, pIdx - 1);
    quickSort(arr, pIdx + 1, hi);
  }
  return arr;
}

function partition(arr, lo, hi) {
  let pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
  return i + 1;
}

const input = [29, 10, 14, 37, 13];
console.log("Sorted:", quickSort(input));`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int partition(std::vector<int>& arr, int lo, int hi) {
    int pivot = arr[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; ++j) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[hi]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int lo, int hi) {
    if (lo < hi) {
        int pIdx = partition(arr, lo, hi);
        quickSort(arr, lo, pIdx - 1);
        quickSort(arr, pIdx + 1, hi);
    }
}

int main() {
    std::vector<int> arr = {29, 10, 14, 37, 13};
    quickSort(arr, 0, arr.size() - 1);
    
    std::cout << "Sorted: ";
    for (int x : arr) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}`,
      java: `import java.util.Arrays;

public class Main {
    public static void quickSort(int[] arr, int lo, int hi) {
        if (lo < hi) {
            int pIdx = partition(arr, lo, hi);
            quickSort(arr, lo, pIdx - 1);
            quickSort(arr, pIdx + 1, hi);
        }
    }

    private static int partition(int[] arr, int lo, int hi) {
        int pivot = arr[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[hi];
        arr[hi] = temp;
        return i + 1;
    }

    public static void main(String[] args) {
        int[] arr = {29, 10, 14, 37, 13};
        quickSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
    },
  },
  {
    id: "searching",
    name: "Searching Algorithms",
    tagline: "Finding the location of target records inside data structures.",
    icon: "🔍",
    summary:
      "Searching locate occurrences of query values within an index, reducing key lookups in sorted domains.",
    theoryParagraphs: [
      "Linear Search represents the brute-force search baseline. It steps through every element sequentially, making it applicable to unordered arrays but running in slow O(n) time.",
      "Binary Search is a highly optimized logarithmic O(log n) alternative that operates by binary halving. It strictly requires the array to be pre-sorted. At each step, it evaluates the midpoint, eliminating half of the search boundaries based on whether the target is larger or smaller.",
      "Binary search is incredibly fast: searching through 1,000,000 sorted elements takes at most 20 comparison steps.",
    ],
    complexities: [
      { operation: "Binary Search", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
      { operation: "Linear Search", average: "O(n)", worst: "O(n)", space: "O(1)" },
    ],
    interviewPatterns: [
      "Standard binary search bounds (lo <= hi)",
      "Lower bounds / Upper bounds insertion points",
      "Binary search on solution spaces (e.g., Koko Eating Bananas)",
      "Search in a rotated sorted array",
    ],
    codeTitle: "Binary Search Implementation",
    codeSnippets: {
      javascript: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    let mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return -1;
}

const arr = [12, 24, 35, 47, 58, 69, 90];
console.log("Index of 47:", binarySearch(arr, 47));`,
      cpp: `#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return -1;
}

int main() {
    std::vector<int> arr = {12, 24, 35, 47, 58, 69, 90};
    std::cout << "Index of 47: " << binarySearch(arr, 47) << std::endl;
    return 0;
}`,
      java: `public class Main {
    public static int binarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {12, 24, 35, 47, 58, 69, 90};
        System.out.println("Index of 47: " + binarySearch(arr, 47));
    }
}`,
    },
  },
];

function LearnPage() {
  const [activeTopicId, setActiveTopicId] = useState(DETAILED_TOPICS[0].id);
  const activeTopic = DETAILED_TOPICS.find((t) => t.id === activeTopicId) || DETAILED_TOPICS[0];
  const [codeLang, setCodeLang] = useState<"javascript" | "java" | "cpp">("javascript");

  // SVG Concept Nodes positions
  const nodes = [
    {
      id: "arrays",
      label: "Arrays & Strings",
      x: 100,
      y: 100,
      icon: "▦",
      desc: "Linear memory blocks",
    },
    { id: "searching", label: "Searching", x: 280, y: 60, icon: "🔍", desc: "Logarithmic lookup" },
    { id: "sorting", label: "Sorting", x: 280, y: 160, icon: "↕", desc: "Sequential ordering" },
    {
      id: "linked-lists",
      label: "Linked Lists",
      x: 100,
      y: 300,
      icon: "→",
      desc: "Reference pointers",
    },
    { id: "trees", label: "Trees & BSTs", x: 380, y: 220, icon: "⋎", desc: "Hierarchical lookups" },
    { id: "graphs", label: "Graphs", x: 380, y: 360, icon: "◌", desc: "Network graphs" },
  ];

  // Connections between nodes
  const connections = [
    { from: "arrays", to: "searching" },
    { from: "arrays", to: "sorting" },
    { from: "arrays", to: "linked-lists" },
    { from: "linked-lists", to: "trees" },
    { from: "trees", to: "graphs" },
    { from: "sorting", to: "trees" },
  ];

  return (
    <div className="min-h-dvh relative flex flex-col bg-[#020617] text-[#f8fafc]">
      <div className="absolute top-0 right-0 size-[600px] glow-orb pointer-events-none" />
      <Header />

      <main className="flex-1 relative mx-auto max-w-7xl w-full px-6 py-10">
        <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
          / STUDY INTERFACES
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Concept Journey</h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed mb-10">
          Navigate our interactive node graph mapping standard DSA architectures. Select any concept
          circle to load textbook resources, interview patterns, and code implementations.
        </p>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Concept Journey Map Node System (lg:col-span-5) */}
          <div className="lg:col-span-5 glass-card border-primary/20 p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6 border-b border-border pb-3">
              <span className="text-xs font-mono font-bold text-primary">🗺️ CONCEPT NETWORK</span>
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                Interactive Map
              </span>
            </div>

            <div className="relative w-full aspect-[4/4] bg-[#020617]/50 rounded-2xl border border-border/40 grid-bg overflow-hidden flex items-center justify-center p-2">
              <svg viewBox="0 0 480 440" className="w-full h-full select-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="22"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="rgba(199,244,100,0.3)" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="22"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#C7F464" />
                  </marker>
                </defs>

                {/* render connection lines */}
                {connections.map((conn, idx) => {
                  const fromNode = nodes.find((n) => n.id === conn.from)!;
                  const toNode = nodes.find((n) => n.id === conn.to)!;
                  const isActive = activeTopicId === conn.from || activeTopicId === conn.to;
                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isActive ? "#C7F464" : "rgba(199,244,100,0.2)"}
                      strokeWidth={isActive ? 1.8 : 1.2}
                      markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                      strokeDasharray={isActive ? "none" : "3 3"}
                      className="transition-colors duration-300"
                    />
                  );
                })}

                {/* render nodes */}
                {nodes.map((node) => {
                  const isActive = activeTopicId === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setActiveTopicId(node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Glow Behind Circle if Active */}
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={28}
                          fill="rgba(199,244,100,0.15)"
                          className="animate-pulse-soft"
                        />
                      )}

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={24}
                        fill={isActive ? "#C7F464" : "#030712"}
                        stroke={isActive ? "#C7F464" : "rgba(199,244,100,0.3)"}
                        strokeWidth={2}
                        className="transition-all duration-300 group-hover:stroke-primary group-hover:scale-105"
                      />
                      <text
                        x={node.x}
                        y={node.y + 6}
                        textAnchor="middle"
                        fill={isActive ? "#020617" : "#f8fafc"}
                        className="font-bold text-lg pointer-events-none select-none"
                      >
                        {node.icon}
                      </text>

                      {/* Text label underneath node */}
                      <text
                        x={node.x}
                        y={node.y + 40}
                        textAnchor="middle"
                        fill={isActive ? "#C7F464" : "#94a3b8"}
                        className="text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-300 pointer-events-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 text-[10px] font-mono text-muted-foreground/50 text-center uppercase">
              * Click nodes on map to switch curriculum chapters
            </div>
          </div>

          {/* Right Column: Textbook Workstation Chapter Details (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="glass-card border-primary/20 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

              {/* Textbook Header */}
              <div className="flex items-center gap-6 border-b border-border/40 pb-6">
                <span className="size-16 rounded-2xl bg-gradient-primary text-black flex items-center justify-center text-4xl font-extrabold select-none shadow-[0_0_15px_rgba(199,244,100,0.3)]">
                  {activeTopic.icon}
                </span>
                <div>
                  <div className="font-mono text-[10px] text-primary uppercase tracking-widest font-bold">
                    Chapter Core Resource
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mt-1">{activeTopic.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {activeTopic.tagline}
                  </p>
                </div>
              </div>

              {/* Conceptual Summary */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                  [01] Concept Summary
                </h3>
                <p className="text-base font-semibold leading-relaxed text-foreground">
                  {activeTopic.summary}
                </p>
                {activeTopic.theoryParagraphs.map((p, idx) => (
                  <p key={idx} className="text-sm leading-relaxed text-muted-foreground font-sans">
                    {p}
                  </p>
                ))}
              </div>

              {/* Complexity Table Matrix */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                  [02] Complexity Matrix
                </h3>
                <div className="overflow-hidden rounded-xl border border-border/40 bg-[#030712]/50">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#030712] text-muted-foreground uppercase text-[9px] tracking-widest border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Operation</th>
                        <th className="px-4 py-3">Average Case</th>
                        <th className="px-4 py-3">Worst Case</th>
                        <th className="px-4 py-3">Space complexity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-[#020617]/20">
                      {activeTopic.complexities.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-sans font-semibold text-foreground">
                            {comp.operation}
                          </td>
                          <td className="px-4 py-3 text-primary font-bold">{comp.average}</td>
                          <td className="px-4 py-3 text-amber-400 font-bold">{comp.worst}</td>
                          <td className="px-4 py-3 text-muted-foreground">{comp.space}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Interview Patterns */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                  [03] Key Interview Patterns
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeTopic.interviewPatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-border/40 bg-[#030712]/30 text-xs text-muted-foreground font-sans"
                    >
                      <span className="text-primary text-[10px] font-mono mt-0.5">▶</span>
                      <span>{pat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference Implementation Templates */}
              <div className="space-y-4 pt-6 border-t border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                      [04] Template Blueprint
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                      {activeTopic.codeTitle}
                    </p>
                  </div>
                  <div className="flex gap-1.5 self-start sm:self-center">
                    {(["javascript", "java", "cpp"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setCodeLang(l)}
                        className={`px-3 py-1 rounded text-[10px] font-mono tracking-wide uppercase transition-all cursor-pointer ${
                          codeLang === l
                            ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(199,244,100,0.2)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {l === "javascript" ? "js" : l === "cpp" ? "cpp" : "java"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 overflow-hidden bg-black/40">
                  <Editor
                    height="280px"
                    language={codeLang}
                    theme="vs-dark"
                    value={activeTopic.codeSnippets[codeLang]}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineHeight: 20,
                      fontFamily: "JetBrains Mono, ui-monospace, monospace",
                      lineNumbers: "on",
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "auto",
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
