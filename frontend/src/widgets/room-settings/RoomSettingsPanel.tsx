import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  DoorOpen,
  Presentation,
  Coffee,
  Zap,
  Leaf,
  Flame,
  Star,
  Hexagon,
  BookOpen,
  Globe,
  Users,
  FileText,
  AlertTriangle,
  Save,
  Building2,
} from 'lucide-react';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '../../entities/meeting/hooks';
import type { Room } from '../../entities/room/types';
import { Button } from '../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../shared/ui/dialog';

// ── Icon palette (same as sidebar) ──────────────────────────────────────────
const ROOM_ICONS = [DoorOpen, Presentation, Coffee, Zap, Leaf, Flame, Star, Hexagon, BookOpen, Globe];
const ROOM_COLORS = [
  'text-purple-500', 'text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-pink-500',
  'text-red-500', 'text-cyan-500', 'text-indigo-500', 'text-lime-500', 'text-orange-500',
];
const ROOM_RINGS = [
  'ring-purple-500/20', 'ring-blue-500/20', 'ring-emerald-500/20', 'ring-amber-500/20', 'ring-pink-500/20',
  'ring-red-500/20', 'ring-cyan-500/20', 'ring-indigo-500/20', 'ring-lime-500/20', 'ring-orange-500/20',
];
const ROOM_BG_SOFT = [
  'bg-purple-500/10', 'bg-blue-500/10', 'bg-emerald-500/10', 'bg-amber-500/10', 'bg-pink-500/10',
  'bg-red-500/10', 'bg-cyan-500/10', 'bg-indigo-500/10', 'bg-lime-500/10', 'bg-orange-500/10',
];
const getRoomIcon = (i: number) => ROOM_ICONS[i % ROOM_ICONS.length];

// ── Zod schemas ──────────────────────────────────────────────────────────────
const roomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(60, 'Max 60 characters'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').max(500, 'Max 500'),
  description: z.string().trim().max(200, 'Max 200 characters').optional(),
});
type RoomFormValues = z.infer<typeof roomSchema>;

// ── Inline edit row — no <form> wrapper (invalid inside <tr>) ────────────────
interface EditRowProps {
  room: Room;
  onCancel: () => void;
}
const EditRow: React.FC<EditRowProps> = ({ room, onCancel }) => {
  const { mutateAsync: updateRoom, isPending } = useUpdateRoom();

  const [name, setName] = React.useState(room.name);
  const [capacity, setCapacity] = React.useState(String(room.capacity));
  const [description, setDescription] = React.useState(room.description ?? '');
  const [errors, setErrors] = React.useState<{ name?: string; capacity?: string }>({});

  const validate = () => {
    const errs: { name?: string; capacity?: string } = {};
    if (!name.trim()) errs.name = 'Room name is required';
    if (name.trim().length > 60) errs.name = 'Max 60 characters';
    const cap = Number(capacity);
    if (!capacity || isNaN(cap) || !Number.isInteger(cap) || cap < 1) errs.capacity = 'Capacity must be at least 1';
    if (cap > 500) errs.capacity = 'Max 500';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await updateRoom({ id: room._id, data: { name: name.trim(), capacity: Number(capacity), description: description.trim() || undefined } });
    onCancel();
  };

  return (
    <>
      <td className="p-3">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition"
          />
          {errors.name && <p className="text-[10px] text-destructive mt-1">{errors.name}</p>}
        </div>
      </td>
      <td className="p-3">
        <div>
          <input
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            type="number"
            min={1}
            className="w-20 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition"
          />
          {errors.capacity && <p className="text-[10px] text-destructive mt-1">{errors.capacity}</p>}
        </div>
      </td>
      <td className="p-3 hidden md:table-cell">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition"
        />
      </td>
      <td className="p-3 text-right">
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            size="icon"
            loading={isPending}
            onClick={handleSave}
            className="h-7 w-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {!isPending && <Check className="w-3.5 h-3.5" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted-foreground/10"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </>
  );
};


// ── Add Room Form ─────────────────────────────────────────────────────────────
const AddRoomForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { mutateAsync: createRoom, isPending } = useCreateRoom();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', capacity: 10, description: '' },
  });

  const onSubmit = async (values: RoomFormValues) => {
    await createRoom(values as { name: string; capacity: number; description?: string });
    reset();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Room Name *</label>
          <input
            {...register('name')}
            autoFocus
            placeholder="e.g. Conference Room A"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
          {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Capacity *</label>
          <input
            {...register('capacity')}
            type="number"
            min={1}
            placeholder="10"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
          {errors.capacity && <p className="text-[10px] text-destructive">{errors.capacity.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
        <input
          {...register('description')}
          placeholder="Optional — e.g. Has projector, whiteboard, 4K display..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
        />
        {errors.description && <p className="text-[10px] text-destructive">{errors.description.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
        <Button type="button" variant="outline" onClick={onClose} className="h-8 px-4 text-xs">Cancel</Button>
        <Button type="submit" loading={isPending} className="h-8 px-4 text-xs font-semibold">
          {!isPending && <Save className="w-3.5 h-3.5 mr-1.5" />}
          Create Room
        </Button>
      </div>
    </form>
  );
};

// ── Main Settings Panel ───────────────────────────────────────────────────────
export const RoomSettingsPanel: React.FC = () => {
  const { data: rooms = [], isLoading } = useRooms();
  const { mutateAsync: deleteRoom, isPending: deletePending } = useDeleteRoom();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteRoom(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Room Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, edit, and manage meeting rooms — changes apply immediately.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 h-8 px-4 text-xs font-semibold w-fit shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Room
        </Button>
      </div>

      {/* Add Room Panel */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border border-primary/30 bg-card shadow-md shadow-primary/5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Meeting Room
                </CardTitle>
                <CardDescription className="text-[11px]">Fill in the details to create a new room</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <AddRoomForm onClose={() => setIsAddOpen(false)} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms Table */}
      <Card className="border border-border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-muted-foreground text-xs">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <DoorOpen className="w-10 h-10 stroke-1 text-muted-foreground/40" />
            <p className="font-semibold text-sm text-foreground">No rooms yet</p>
            <p className="text-xs">Click "Add New Room" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                  <th className="p-3 pl-4">Room</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3 hidden md:table-cell">Description</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {rooms.map((room, index) => {
                  const RoomIcon = getRoomIcon(index);
                  const iconColor = ROOM_COLORS[index % ROOM_COLORS.length];
                  const bgSoft = ROOM_BG_SOFT[index % ROOM_BG_SOFT.length];
                  const ring = ROOM_RINGS[index % ROOM_RINGS.length];
                  const isEditing = editingId === room._id;

                  return (
                    <tr key={room._id} className="hover:bg-muted-foreground/5 dark:hover:bg-muted/10 transition-colors">
                      {isEditing ? (
                        <EditRow room={room} onCancel={() => setEditingId(null)} />
                      ) : (
                        <>
                          <td className="p-3 pl-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg ${bgSoft} ring-1 ${ring}`}>
                                <RoomIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                              </div>
                              <span className="font-bold text-foreground">{room.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-muted-foreground font-semibold">
                              <Users className="w-3 h-3" />
                              <span>{room.capacity}</span>
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell text-muted-foreground max-w-[220px] truncate">
                            {room.description ? (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3 shrink-0" />
                                {room.description}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40 italic text-[10px]">No description</span>
                            )}
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingId(room._id)}
                                className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                                title="Edit room"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(room)}
                                className="h-7 w-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Delete room"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary Row */}
      {rooms.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-semibold">{rooms.length} room{rooms.length !== 1 ? 's' : ''} total</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 inline-block" />
          <span>Total capacity: <strong className="text-foreground">{rooms.reduce((a, r) => a + (r.capacity || 0), 0)}</strong> seats</span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Room
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete <strong>"{deleteTarget?.name}"</strong>?
              <br />
              This action cannot be undone. If this room has active meetings, deletion will be blocked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              loading={deletePending}
              className="w-full sm:w-auto h-9 text-xs font-semibold"
            >
              Delete Room
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="w-full sm:w-auto h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
