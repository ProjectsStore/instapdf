import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './SlideCard.css';

/**
 * Individual slide card — draggable, deletable, shows order badge.
 */
export default function SlideCard({ slide, index, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: `${index * 60}ms`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`slide-card ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="slide-card-image-wrapper">
        <img
          className="slide-card-image"
          src={slide.url}
          alt={`Slide ${index + 1}`}
          loading="lazy"
          draggable="false"
        />

        {/* Order badge */}
        <span className="slide-card-badge">{index + 1}</span>

        {/* Delete button */}
        <button
          className="slide-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slide.id);
          }}
          title="Remove slide"
          aria-label={`Remove slide ${index + 1}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Drag hint */}
        <div className="slide-card-handle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
