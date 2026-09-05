"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  ArrowRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskItem } from "@/lib/types";

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Send WhatsApp audit teaser link to Dr. Ananya Sharma",
    description: "Follow up between 11 AM - 1:30 PM regarding mobile booking gap",
    dueDate: new Date().toISOString().split("T")[0], // Today
    priority: "urgent",
    status: "pending",
    nextActionTag: "WhatsApp Outreach",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "15-Minute discovery call with Vikram Malhotra (Apex Orthodontics)",
    description: "Walk through before/after speed numbers and proposal scope",
    dueDate: new Date().toISOString().split("T")[0], // Today
    priority: "high",
    status: "pending",
    nextActionTag: "Scheduled Meeting",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Send final proposal contract to Dr. Mehta's Dental Hub",
    description: "Prepare 50% advance invoice and project roadmap",
    dueDate: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday (Overdue)
    priority: "urgent",
    status: "overdue",
    nextActionTag: "Contract Sign-off",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Review PageSpeed metrics for Perfect Teeth Clinic",
    description: "Run deep Core Web Vitals audit before Tuesday call",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // 2 days ahead
    priority: "medium",
    status: "pending",
    nextActionTag: "Technical Audit",
    createdAt: new Date().toISOString(),
  },
];

export function FollowUpTaskManager() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem("l2l_v2_tasks");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TASKS;
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "overdue" | "upcoming">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem["priority"]>("high");
  const [newTaskTag, setNewTaskTag] = useState("Follow-up");

  const saveTasks = (updated: TaskItem[]) => {
    setTasks(updated);
    try {
      localStorage.setItem("l2l_v2_tasks", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextStatus: TaskItem["status"] = t.status === "completed" ? "pending" : "completed";
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveTasks(updated);
    toast.success("Task updated!");
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    toast.success("Task deleted");
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const isOverdue = newTaskDate < todayStr;

    const newTask: TaskItem = {
      id: "task-" + Date.now(),
      title: newTaskTitle.trim(),
      dueDate: newTaskDate,
      priority: newTaskPriority,
      status: isOverdue ? "overdue" : "pending",
      nextActionTag: newTaskTag,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setShowAddForm(false);
    toast.success("Task scheduled successfully!");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate Overdue, Due Today, and Upcoming
  const overdueCount = tasks.filter((t) => t.status !== "completed" && t.dueDate < todayStr).length;
  const dueTodayCount = tasks.filter((t) => t.status !== "completed" && t.dueDate === todayStr).length;
  const upcomingCount = tasks.filter((t) => t.status !== "completed" && t.dueDate > todayStr).length;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeFilter === "today") return t.dueDate === todayStr;
      if (activeFilter === "overdue") return t.status !== "completed" && t.dueDate < todayStr;
      if (activeFilter === "upcoming") return t.dueDate > todayStr;
      return true;
    });
  }, [tasks, activeFilter, todayStr]);

  return (
    <div className="space-y-6">
      {/* Top Banner & 3 KPI Widgets */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                Agency Action Center
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Never Lose a Deal Inside the CRM
              </span>
            </div>
            <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
              Follow-up & Task Operating System
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Persistent next actions, meeting alerts, and deadline tracking for every active deal.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="h-9 text-xs gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Task
          </Button>
        </div>

        {/* 3 Dashboard Widgets: Overdue, Due Today, Upcoming */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/60">
          <div
            onClick={() => setActiveFilter("overdue")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeFilter === "overdue"
                ? "bg-destructive/15 border-destructive shadow-md shadow-destructive/10"
                : "bg-card border-border/60 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Overdue Tasks
              </span>
              <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
            </div>
            <div className="text-2xl font-black font-mono text-destructive mt-1">
              🔴 {overdueCount} Overdue
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Immediate action needed to save deal</p>
          </div>

          <div
            onClick={() => setActiveFilter("today")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeFilter === "today"
                ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                : "bg-card border-border/60 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Due Today
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-500 mt-1">
              🟠 {dueTodayCount} Due Today
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Scheduled calls & WhatsApp follow-ups</p>
          </div>

          <div
            onClick={() => setActiveFilter("upcoming")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeFilter === "upcoming"
                ? "bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10"
                : "bg-card border-border/60 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Upcoming
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-500 mt-1">
              🟢 {upcomingCount} Upcoming
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Next actions scheduled this month</p>
          </div>
        </div>
      </div>

      {/* Task List Card */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Active Tasks ({filteredTasks.length})
          </CardTitle>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("today")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === "today" ? "bg-card text-amber-500 shadow-sm" : "text-muted-foreground"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === "overdue" ? "bg-card text-destructive shadow-sm" : "text-muted-foreground"
              }`}
            >
              Overdue
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 divide-y divide-border/60">
          {filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            const isLate = !isDone && task.dueDate < todayStr;
            const isToday = !isDone && task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  isDone ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    className="mt-0.5 h-5 w-5 rounded-md border border-border flex items-center justify-center text-primary transition hover:border-primary"
                  >
                    {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold text-foreground ${
                          isDone ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.nextActionTag && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                          {task.nextActionTag}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          task.priority === "urgent"
                            ? "bg-destructive/15 text-destructive"
                            : task.priority === "high"
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isLate
                        ? "text-destructive"
                        : isToday
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isLate ? "⚠️ Overdue: " : isToday ? "⏰ Today: " : "📅 "}
                    {task.dueDate}
                  </span>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No tasks found for this view.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-2xl max-w-md mx-auto space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Schedule Next Action Task</h3>
            <button onClick={() => setShowAddForm(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Task / Action Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Call Dr. Rajesh regarding proposal feedback"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full h-9 text-xs bg-muted border border-border rounded-lg px-2 text-foreground"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Category Tag</label>
              <Input
                value={newTaskTag}
                onChange={(e) => setNewTaskTag(e.target.value)}
                placeholder="e.g. WhatsApp, Call, Proposal, Meeting"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <Button onClick={handleAddTask} className="w-full h-10 font-bold bg-primary text-primary-foreground rounded-xl">
            Save Next Action
          </Button>
        </div>
      )}
    </div>
  );
}
