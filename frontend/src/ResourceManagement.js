import React, {
  useEffect,
  useState
} from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://project-tracker-production-1803.up.railway.app";

const LEVELS = [
  "Helper",
  "Technician",
  "Supervisor",
  "Engineer",
  "Site Manager"
];

const TRADES = [
  "Electrical",
  "Mechanical",
  "HVAC",
  "Plumbing",
  "Civil",
  "Painting",
  "Carpentry",
  "General Works"
];

export default function ResourceManagement({
  token
}) {

  const [resources, setResources] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [editingResource,
    setEditingResource
  ] = useState(null);

  const [form, setForm] =
    useState({
      name: "",
      level: "Technician",
      trade: "General Works",
      company: "",
      phone: "",
      hireDate: "",
      releaseDate: ""
    });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources =
    async () => {

      try {

        const res = await fetch(
          `${API_BASE}/resources`,
          {
            headers: {
              Authorization: token
            }
          }
        );

        const data =
          await res.json();

        setResources(data);

      } catch (err) {

        console.error(err);

      }
    };

  const resetForm = () => {

    setForm({
      name: "",
      level: "Technician",
      trade: "General Works",
      company: "",
      phone: "",
      hireDate: "",
      releaseDate: ""
    });

    setEditingResource(null);

  };

  const addResource =
    async () => {

      try {

        await fetch(
          `${API_BASE}/resources`,
          {
            method: "POST",
            headers: {
              Authorization:
                token,

              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify(
                form
              )
          }
        );

        resetForm();

        loadResources();

      } catch (err) {

        console.error(err);

      }
    };

  const updateResource =
    async () => {

      try {

        await fetch(
          `${API_BASE}/resources/${editingResource._id}`,
          {
            method: "PUT",
            headers: {
              Authorization:
                token,

              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify(
                form
              )
          }
        );

        resetForm();

        loadResources();

      } catch (err) {

        console.error(err);

      }
    };

  const deleteResource =
    async (id) => {

      if (
        !window.confirm(
          "Delete resource?"
        )
      )
        return;

      try {

        await fetch(
          `${API_BASE}/resources/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                token
            }
          }
        );

        loadResources();

      } catch (err) {

        console.error(err);

      }
    };

  const editResource =
    (resource) => {

      setEditingResource(resource);

      setForm({
        name:
          resource.name || "",

        level:
          resource.level ||
          "Technician",

        trade:
          resource.trade ||
          "General Works",

        company:
          resource.company ||
          "",

        phone:
          resource.phone ||
          "",

        hireDate:
          resource.hireDate
            ? resource.hireDate
                .split("T")[0]
            : "",

        releaseDate:
          resource.releaseDate
            ? resource.releaseDate
                .split("T")[0]
            : ""
      });
    };

  const filteredResources =
    resources.filter(
      (resource) =>
        resource.name
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        resource.company
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        resource.trade
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  return (
    <div className="resource-page">

      <h2>
        👷 Resource Management
      </h2>

      {/* FORM */}

      <div className="resource-form">

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name:
                e.target.value
            })
          }
        />

        <select
          value={form.level}
          onChange={(e) =>
            setForm({
              ...form,
              level:
                e.target.value
            })
          }
        >
          {LEVELS.map(level => (
            <option
              key={level}
            >
              {level}
            </option>
          ))}
        </select>

        <select
          value={form.trade}
          onChange={(e) =>
            setForm({
              ...form,
              trade:
                e.target.value
            })
          }
        >
          {TRADES.map(trade => (
            <option
              key={trade}
            >
              {trade}
            </option>
          ))}
        </select>

        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({
              ...form,
              company:
                e.target.value
            })
          }
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone:
                e.target.value
            })
          }
        />

        <input
          type="date"
          value={form.hireDate}
          onChange={(e) =>
            setForm({
              ...form,
              hireDate:
                e.target.value
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

      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px"
        }}
      >

        {editingResource ? (

          <>
            <button
              onClick={
                updateResource
              }
            >
              Update Resource
            </button>

            <button
              onClick={
                resetForm
              }
            >
              Cancel
            </button>
          </>

        ) : (

          <button
            onClick={
              addResource
            }
          >
            Add Resource
          </button>

        )}

      </div>

      {/* SEARCH */}

      <input
        className="resource-search"
        placeholder="Search resources..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
      />

      {/* TABLE */}

      <table className="resource-table">

        <thead>

          <tr>

            <th>Name</th>

            <th>Level</th>

            <th>Trade</th>

            <th>Company</th>

            <th>Phone</th>

            <th>Hire Date</th>

            <th>Release Date</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {filteredResources.map(
            (resource) => (

              <tr
                key={
                  resource._id
                }
              >

                <td>
                  {resource.name}
                </td>

                <td>
                  {resource.level}
                </td>

                <td>
                  {resource.trade}
                </td>

                <td>
                  {
                    resource.company
                  }
                </td>

                <td>
                  {resource.phone}
                </td>

                <td>
                  {resource.hireDate
                    ? new Date(
                        resource.hireDate
                      ).toLocaleDateString()
                    : ""}
                </td>

                <td>
                  {resource.releaseDate
                    ? new Date(
                        resource.releaseDate
                      ).toLocaleDateString()
                    : ""}
                </td>

                <td>

                  <button
                    onClick={() =>
                      editResource(
                        resource
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteResource(
                        resource._id
                      )
                    }
                  >
                    Delete
                  </button>

                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
}