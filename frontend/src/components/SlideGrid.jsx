import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import SlideCard from './SlideCard';
import './SlideGrid.css';

/**
 * Sortable grid of slide cards with drag-and-drop reordering.
 */
export default function SlideGrid({ slides, postInfo, onDelete, onReorder }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag threshold to allow clicks
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  const activeSlide = activeId
    ? slides.find((s) => s.id === activeId)
    : null;

  if (slides.length === 0) return null;

  return (
    <div className="slide-grid-section">
      {/* Post info */}
      {postInfo && (
        <div className="slide-grid-info">
          {postInfo.username && (
            <span className="slide-grid-info-username">
              @{postInfo.username}
            </span>
          )}
          {postInfo.caption && (
            <span className="slide-grid-info-caption" title={postInfo.caption}>
              {postInfo.caption}
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="slide-grid-header">
        <h2 className="slide-grid-title">Slides</h2>
        <span className="slide-grid-count">
          {slides.length} slide{slides.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sortable grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slides.map((s) => s.id)}
          strategy={rectSortingStrategy}
        >
          <div className="slide-grid">
            {slides.map((slide, index) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                index={index}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay — shows a copy of the card being dragged */}
        <DragOverlay>
          {activeSlide ? (
            <div className="slide-grid-overlay">
              <img
                src={`https://instapdf-henna.vercel.app${activeSlide.url}`}
                alt="Dragging"
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                }}
                draggable="false"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
