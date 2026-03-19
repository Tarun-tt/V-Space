import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MySpace = () => {
  const navigate = useNavigate();

  const [mySpaceItems, setMySpaceItems] = useState([
    {
      id: 1,
      title: "Q4 Financial Report",
      date: "2024-01-15",
      status: "Draft",
      description: "Quarterly financial report for Q4 2023",
      category: "Financial",
      lastModified: "2024-01-15",
    },
    {
      id: 2,
      title: "Project Proposal",
      date: "2024-01-16",
      status: "Submitted",
      description: "New product development proposal",
      category: "Project",
      lastModified: "2024-01-16",
    },
    {
      id: 3,
      title: "Contract Agreement",
      date: "2024-01-17",
      status: "Approved",
      description: "Vendor contract for Q1 2024",
      category: "Legal",
      lastModified: "2024-01-17",
    },
    {
      id: 4,
      title: "Meeting Minutes",
      date: "2024-01-18",
      status: "Draft",
      description: "Board meeting minutes - January 2024",
      category: "Meeting",
      lastModified: "2024-01-18",
    },
    {
      id: 1,
      title: "Q4 Financial Report",
      date: "2024-01-15",
      status: "Draft",
      description: "Quarterly financial report for Q4 2023",
      category: "Financial",
      lastModified: "2024-01-15",
    },
    {
      id: 2,
      title: "Project Proposal",
      date: "2024-01-16",
      status: "Submitted",
      description: "New product development proposal",
      category: "Project",
      lastModified: "2024-01-16",
    },
    {
      id: 3,
      title: "Contract Agreement",
      date: "2024-01-17",
      status: "Approved",
      description: "Vendor contract for Q1 2024",
      category: "Legal",
      lastModified: "2024-01-17",
    },
    {
      id: 4,
      title: "Meeting Minutes",
      date: "2024-01-18",
      status: "Draft",
      description: "Board meeting minutes - January 2024",
      category: "Meeting",
      lastModified: "2024-01-18",
    },
  ]);

  const handleAddNew = () => {
    navigate("/myspace/form");
  };

  const handleEdit = (id) => {
    navigate(`/myspace/form/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setMySpaceItems(mySpaceItems.filter((item) => item.id !== id));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "badge-warning";
      case "submitted":
        return "badge-info";
      case "approved":
        return "badge-success";
      case "rejected":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "📝";
      case "submitted":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "📄";
    }
  };

  return (
    <section className="main-section p-4">
      <div className="my-space-header">
        <h1>My Space</h1>
        <button
          className="btn btn-outline"
          style={{
            backgroundColor: "#0066B3",
            color: "white",
            borderColor: "#0066B3",
          }}
          onClick={handleAddNew}
        >
          + Add New
        </button>
      </div>

      <div className="shadowBox">
        <div className="my-space-content">
          {/* Cards Grid */}
          <div className="cards-grid">
            {mySpaceItems.length > 0 ? (
              mySpaceItems.map((item) => (
                <div key={item.id} className="card-item">
                  <div className="card-header">
                    <div className="card-icon">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(item.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleEdit(item.id)}
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div
                    className="card-body"
                    onClick={() => handleEdit(item.id)}
                  >
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-description">{item.description}</p>

                    <div className="card-meta">
                      <span className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{item.category}</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">{item.date}</span>
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span
                      className={`badge ${getStatusBadgeClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                    <span className="last-modified">
                      Modified: {item.lastModified}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No Documents Found</h3>
                <p>Click the "Add New" button to create your first document.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .my-space-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .my-space-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .my-space-content {
          padding: 20px;
        }

        /* Cards Grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #e0e0e0;
        }

        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-color: #0066B3;
        }

        .card-header {
          padding: 15px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #dee2e6;
        }

        .card-icon {
          font-size: 24px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-icon:hover {
          transform: scale(1.1);
        }

        .btn-edit:hover {
          background-color: #28a745;
          color: white;
        }

        .btn-view:hover {
          background-color: #17a2b8;
          color: white;
        }

        .btn-delete:hover {
          background-color: #dc3545;
          color: white;
        }

        .card-body {
          padding: 20px;
          cursor: pointer;
          flex: 1;
        }

        .card-title {
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .card-description {
          margin: 0 0 15px 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .meta-label {
          color: #999;
        }

        .meta-value {
          color: #333;
          font-weight: 500;
        }

        .card-footer {
          padding: 15px;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-warning {
          background-color: #ffc107;
          color: #212529;
        }

        .badge-info {
          background-color: #17a2b8;
          color: white;
        }

        .badge-success {
          background-color: #28a745;
          color: white;
        }

        .badge-danger {
          background-color: #dc3545;
          color: white;
        }

        .badge-secondary {
          background-color: #6c757d;
          color: white;
        }

        .last-modified {
          font-size: 11px;
          color: #999;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin-bottom: 10px;
          color: #666;
        }

        .empty-state p {
          color: #999;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </section>
  );
};

export default MySpace;
