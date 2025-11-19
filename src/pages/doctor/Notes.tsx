import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  XIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
}

interface PatientNote {
  _id: string;
  patientId: string;
  patientName: string;
  date: string;
  lastUpdated: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: string[];
  followUp?: string;
  tags: string[];
  status: "draft" | "completed";
}

// ✅ Typed list of editable text fields
type NoteField =
  | "chiefComplaint"
  | "subjective"
  | "objective"
  | "assessment"
  | "plan";

export default function Notes() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<PatientNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newNote, setNewNote] = useState<Partial<PatientNote>>({
    patientId: "",
    chiefComplaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    prescriptions: [],
    tags: [],
    status: "draft",
  });

  // ✅ Fetch Patients
  useEffect(() => {
    fetch("http://localhost:5000/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.log("Patients Fetch Error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Fetch Notes
  useEffect(() => {
    fetch("http://localhost:5000/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.log("Notes Fetch Error:", err));
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-ZA");

  const filteredNotes = notes.filter((n) =>
    (n.patientName + n.chiefComplaint).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Save Note
  const handleSaveNote = async () => {
    setSaving(true);
    const payload = {
      ...newNote,
      date: newNote.date || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    try {
      if (isEditing && selectedNote) {
        await fetch(`http://localhost:5000/notes/${selectedNote._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setNotes((prev) =>
          prev.map((n) =>
            n._id === selectedNote._id ? { ...n, ...payload } as PatientNote : n
          )
        );
      } else {
        const res = await fetch("http://localhost:5000/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setNotes([created, ...notes]);
      }

      setIsEditing(false);
      setSelectedNote(null);
      setNewNote({
        patientId: "",
        chiefComplaint: "",
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        prescriptions: [],
        tags: [],
        status: "draft",
      });
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleViewNote = (note: PatientNote) => {
    setSelectedNote(note);
    setIsEditing(false);
  };

  const handleEditNote = (note: PatientNote) => {
    setSelectedNote(note);
    setNewNote(note);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsEditing(true);
  };

  const closeModal = () => {
    setSelectedNote(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinical Notes</h1>
            <p className="text-gray-600 mt-1">Document and manage patient encounters</p>
          </div>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by patient or complaint..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Notes List */}
        <Card className="overflow-hidden">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notes found...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotes.map((note) => (
                <div key={note._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">{note.patientName}</h3>
                        <Badge
                          variant={note.status === "completed" ? "success" : "warning"}
                        >
                          {note.status === "completed" ? (
                            <div className="flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Completed
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              Draft
                            </div>
                          )}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{note.chiefComplaint}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(note.date)}
                        </div>
                        {note.lastUpdated && (
                          <span>Last updated: {formatDate(note.lastUpdated)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewNote(note)}
                        className="flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="flex items-center gap-1"
                      >
                        <EditIcon className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Modal */}
        {(selectedNote || isEditing) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? "Edit Note" : "View Note"}
                  </h2>
                  <Button variant="secondary" size="sm" onClick={closeModal}>
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>

                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveNote(); }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newNote.patientId}
                        onChange={(e) => setNewNote({ ...newNote, patientId: e.target.value })}
                        required
                      >
                        <option value="">Select patient...</option>
                        {patients.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {(["chiefComplaint", "subjective", "objective", "assessment", "plan"] as NoteField[]).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                          rows={field === "chiefComplaint" ? 2 : 4}
                          value={newNote[field] ?? ""}
                          onChange={(e) => setNewNote({ ...newNote, [field]: e.target.value })}
                          required={field === "chiefComplaint"}
                        />
                      </div>
                    ))}

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={saving} className="flex-1">
                        {saving ? "Saving..." : "Save Note"}
                      </Button>
                      <Button type="button" variant="secondary" onClick={closeModal}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  selectedNote && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 pb-4 border-b">
                        <UserIcon className="w-6 h-6 text-gray-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedNote.patientName}</h3>
                          <p className="text-sm text-gray-500">{formatDate(selectedNote.date)}</p>
                        </div>
                        <Badge variant={selectedNote.status === "completed" ? "success" : "warning"}>
                          {selectedNote.status}
                        </Badge>
                      </div>

                      {(["chiefComplaint", "subjective", "objective", "assessment", "plan"] as NoteField[]).map((field) => (
                        <div key={field}>
                          <h4 className="font-medium text-gray-900 mb-2 capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedNote[field] || "No data"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
