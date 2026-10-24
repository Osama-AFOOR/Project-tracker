//ResourceManagement.js
import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://project-tracker-production-1803.up.railway.app";

export default function ResourceManagement({ token }) {
  const [resources, setResources] = useState([]);

  const [form, setForm] = useState({
    name: "",
    level: "Technician",
    trade: "General Works",
    company: "",
    phone: "",
    hireDate: "",
    releaseDate: ""
  });

  const loadResources = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/resources`,
        {
          headers: {
            Authorization: token
          }
        }
      );

      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const addResource = async () => {
    try {
      await fetch(
        `${API_BASE}/resources`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      setForm({
        name: "",
        level: "Technician",
        trade: "General Works",
        company: "",
        phone: "",
        hireDate: "",
        releaseDate: ""
      });

      loadResources();

    } catch (err) {
      console.error(err);
    }
  };

  const deleteResource = async (id) => {

    if (
      !window.confirm(
        "Delete resource?"
      )
    )
      return;

    await fetch(
      `${API_BASE}/resources/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token
        }
      }
    );

    loadResources();
  };

  return (
    <div>

      <h2>👷 Resource Management</h2>

      <div className="resource-form">

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
        />

        <select
          value={form.level}
          onChange={(e) =>
            setForm({
              ...form,
              level: e.target.value
            })
          }
        >
          <option>Helper</option>
          <option>Technician</option>
          <option>Supervisor</option>
          <option>Engineer</option>
          <option>Site Manager</option>
        </select>

        <select
          value={form.trade}
          onChange={(e) =>
            setForm({
              ...form,
              trade: e.target.value
            })
          }
        >
          <option>Electrical</option>
          <option>Mechanical</option>
          <option>HVAC</option>
          <option>Plumbing</option>
          <option>Civil</option>
          <option>Painting</option>
          <option>Carpentry</option>
          <option>General Works</option>
        </select>

        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({
              ...form,
              company: e.target.value
            })
          }
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value
            })
          }
        />

        <input
          type="date"
          value={form.hireDate}
          onChange={(e) =>
            setForm({
              ...form,
              hireDate: e.target.value
            })
          }
        />

        <input
          type="date"
          value={form.releaseDate}
          onChange={(e) =>
            setForm({
              ...form,
              releaseDate:
                e.target.value
            })
          }
        />

        <button onClick={addResource}>
          Add Resource
        </button>

      </div>

      <table className="resource-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Trade</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {resources.map((r) => (
            <tr key={r._id}>

              <td>{r.name}</td>
              <td>{r.level}</td>
              <td>{r.trade}</td>
              <td>{r.company}</td>
              <td>{r.phone}</td>

              <td>
                <button
                  onClick={() =>
                    deleteResource(r._id)
                  }
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}