import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function App() {
  const [registered, setRegistered] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  useEffect(() => {
    if (user) fetchTodos();
  }, [user]);
  const register = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Registration failed:", error);
      return;
    }
    setRegistered(true);
  };
  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error);
      return;
    }

    setSession(data.session);
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setTodos([]);
  };

  // Fetch todos
  const fetchTodos = async () => {
    let { data, error } = await supabase.rpc("select_todo");
    if (error) console.error(error);
    else setTodos(data);
  };

  // Add todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    let { data, error } = await supabase.rpc("insert_todo", {
      p_title: newTodo,
    });
    if (error) console.error(error);
    else setTodos([data[0], ...todos]);
    setNewTodo("");
  };

  // Toggle completion
  const toggleComplete = async (id, completed) => {
    let { data, error } = await supabase.rpc("toggle_todo", {
      p_id: id,
    });
    if (error) console.error(error);
    else setTodos(todos.map((todo) => (todo.id === id ? data[0] : todo)));
  };

  // Delete todo
  const deleteTodo = async (id) => {
    let { data, error } = await supabase.rpc("delete_todo", {
      p_id: id,
    });
    if (error) console.error(error);
    else setTodos(todos.filter((todo) => todo.id !== id));
  };

  if (registered) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
        <h2>Check your email</h2>
        <p>Please confirm your account before logging in.</p>
        <button onClick={() => setRegistered(false)}>Back to Login</button>
      </div>
    );
  }
  if (!user) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        {authMode === "login" ? (
          <>
            <button
              onClick={login}
              style={{ width: "100%", padding: 10, marginBottom: 10 }}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode("register")}
              style={{ width: "100%", padding: 10 }}
            >
              Need an account? Register
            </button>
          </>
        ) : (
          <>
            <button
              onClick={register}
              style={{ width: "100%", padding: 10, marginBottom: 10 }}
            >
              Register
            </button>
            <button
              onClick={() => setAuthMode("login")}
              style={{ width: "100%", padding: 10 }}
            >
              Already have an account? Login
            </button>
          </>
        )}
      </div>
    );
  }

  // ----------------------------------------
  // MAIN TODO UI
  // ----------------------------------------

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Your Todos</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <div style={{ display: "flex", marginBottom: 20 }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="New todo"
          style={{ flex: 1, marginRight: 10, padding: 8 }}
        />
        <button onClick={addTodo} style={{ padding: 8 }}>
          Add
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: "flex", marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id, todo.completed)}
              style={{ marginRight: 10 }}
            />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.title}
              </div>

              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                {new Date(todo.created_at).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                marginLeft: 10,
                padding: "6px 10px",
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
