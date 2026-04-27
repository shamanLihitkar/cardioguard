import React, { useState } from "react";
import axios from "axios";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [family, setFamily] = useState([
    { name: "", email: "" }
  ]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ➕ Add new family member
  const addFamily = () => {
    setFamily([...family, { name: "", email: "" }]);
  };

  // ❌ Remove family member
  const removeFamily = (index) => {
    const updated = family.filter((_, i) => i !== index);
    setFamily(updated);
  };

  // ✏️ Update family member
  const handleFamilyChange = (index, field, value) => {
    const updated = [...family];
    updated[index][field] = value;
    setFamily(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 🔥 REGISTER
      if (!isLogin) {
        await axios.post("http://localhost:5000/auth/register", {
          ...form,
          familyContacts: family
        });

        alert("Registered successfully. Now login.");
        setIsLogin(true);
        return;
      }

      // 🔥 LOGIN
      const res = await axios.post("http://localhost:5000/auth/login", {
        email: form.email,
        password: form.password
      });

      // ✅ store token + userId
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      alert("Login successful");

      // 👉 redirect
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {/* REGISTER FIELDS */}
        {!isLogin && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <h4>Family Contacts</h4>

            {family.map((member, index) => (
              <div key={index} style={styles.familyBlock}>
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) =>
                    handleFamilyChange(index, "name", e.target.value)
                  }
                  required
                  style={styles.input}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={member.email}
                  onChange={(e) =>
                    handleFamilyChange(index, "email", e.target.value)
                  }
                  required
                  style={styles.input}
                />

                {family.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFamily(index)}
                    style={styles.removeBtn}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addFamily}
              style={styles.addBtn}
            >
              ➕ Add Family Member
            </button>
          </>
        )}

        {/* COMMON FIELDS */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Register"}
        </button>

        <p style={{ marginTop: "10px" }}>
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={styles.link}
          >
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5"
  },
  form: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    width: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  addBtn: {
    padding: "6px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  removeBtn: {
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px",
    cursor: "pointer",
    marginTop: "5px"
  },
  link: {
    color: "blue",
    cursor: "pointer"
  },
  familyBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "5px"
  }
};

export default Auth;