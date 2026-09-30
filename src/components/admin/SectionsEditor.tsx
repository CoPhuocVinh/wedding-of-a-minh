"use client";

import { closestCenter, DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { saveContent } from "@/app/admin/actions";
import type { Section } from "@/lib/types";
import { Card, inputCls, SaveBar, type SaveState } from "./ui";

const NAMES: Record<Section["type"], string> = {
  hero: "Ảnh bìa",
  calendar: "Lịch (save the date)",
  couple: "Cô dâu & chú rể",
  events: "Lịch trình",
  dresscode: "Dress code",
  album: "Album ảnh",
  wishes: "Lời chúc",
  gift: "Hộp mừng cưới",
  countdown: "Đếm ngược",
  thanks: "Lời cảm ơn",
};

export function SectionsEditor({ initial }: { initial: Section[] }) {
  const [sections, setSections] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }));
  const dirty = JSON.stringify(sections) !== saved;

  const update = (id: string, patch: Partial<Section>) => setSections((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setSections((list) => arrayMove(list, list.findIndex((s) => s.id === active.id), list.findIndex((s) => s.id === over.id)));
  }

  async function save() {
    setState({ status: "saving" });
    const res = await saveContent({ sections });
    if (res.ok) {
      setSaved(JSON.stringify(sections));
      setState({ status: "saved" });
    } else setState({ status: "error", error: res.error });
  }

  return (
    <div className="space-y-5">
      <Card title="Thứ tự các phần trên thiệp">
        <p className="text-xs text-stone-500">Kéo biểu tượng ⋮⋮ để đổi thứ tự. Tắt công tắc để ẩn phần đó khỏi thiệp.</p>
        <DndContext id="sections-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {sections.map((s) => (
                <SortableRow key={s.id} section={s} onChange={(patch) => update(s.id, patch)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </Card>
      <SaveBar dirty={dirty} state={state} onSave={save} />
    </div>
  );
}

function SortableRow({ section, onChange }: { section: Section; onChange: (patch: Partial<Section>) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const editable = section.type !== "hero";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-stone-200 bg-white p-3 ${isDragging ? "z-10 shadow-lg" : ""} ${section.visible ? "" : "opacity-60"}`}
    >
      <div className="flex items-center gap-3">
        <button type="button" {...attributes} {...listeners} aria-label="Kéo để sắp xếp" className="cursor-grab touch-none px-1 text-lg text-stone-400 active:cursor-grabbing">
          ⋮⋮
        </button>
        <p className="flex-1 text-sm font-medium">{NAMES[section.type]}</p>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-500">
          {section.visible ? "Hiện" : "Ẩn"}
          <input type="checkbox" checked={section.visible} onChange={(e) => onChange({ visible: e.target.checked })} className="peer sr-only" />
          <span className="relative h-5 w-9 rounded-full bg-stone-300 transition peer-checked:bg-amber-700 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
        </label>
      </div>
      {editable && (
        <div className="mt-3 grid gap-2 pl-8 sm:grid-cols-2">
          <input className={inputCls} placeholder="Dòng nhỏ phía trên" value={section.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <input className={inputCls} placeholder="Tiêu đề" value={section.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
      )}
    </li>
  );
}
