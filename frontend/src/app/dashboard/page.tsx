"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, authFetch } from "@/lib/auth";
import Link from "next/link";
import { LogOut } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  create_date: string;
  update_date: string;
}

export default function DashboardPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all"); // "all", "pending", "completed"

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchTasks();
    }
  }, [isAuthenticated, router, filterStatus]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/tasks`;
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }
      const response = await authFetch(url);
      if (!response.ok) {
        if (response.status === 401) {
            logout();
            router.push("/login");
        }
        throw new Error("Failed to fetch tasks");
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Error fetching tasks.");
    } finally {
      setLoading(false);
    }
  };


  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      setNewTaskTitle("");
      setNewTaskDescription("");
      fetchTasks(); // Refresh tasks after adding
    } catch (err: any) {
      setError(err.message || "Error adding task.");
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
  };

  const handleUpdateTask = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editingTask) return;

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editTitle, description: editDescription, status: editStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setEditingTask(null);
      fetchTasks(); // Refresh tasks after updating
    } catch (err: any) {
      setError(err.message || "Error updating task.");
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("");
  };

  const handleDeleteTask = async (taskId: number) => {
    setError("");

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      fetchTasks(); // Refresh tasks after deleting
    } catch (err: any) {
      setError(err.message || "Error deleting task.");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Tasks</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Add New Task Form */}
        <form onSubmit={handleAddTask} className="mb-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Task
          </button>
        </form>

        {/* Filter Controls */}
        <div className="mb-6">
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status:
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Edit Task Form */}
        {editingTask && (
          <form onSubmit={handleUpdateTask} className="mb-8 p-4 border rounded-md bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <div className="mb-4">
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="edit-status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Task
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Task List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks yet. Add one above!</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="bg-gray-50 p-4 rounded-md shadow-sm mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
                    <p className={`text-sm ${task.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                      Status: {task.status}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
