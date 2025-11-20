import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { ColumnId } from "./KanbanBoard";

export type Car = {
  id: UniqueIdentifier;
  columnId: ColumnId;
  content: string;
}

type CarCardProps = {
  car: Car;
  isOverlay?: boolean;
}

export type CarType = "Car";

export type CarDragData = {
  type: CarType;
  car: Car;
}

export function CarCard({ car, isOverlay }: CarCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: car.id,
    data: {
      type: "Car",
      car,
    } satisfies CarDragData,
    attributes: {
      roleDescription: "Car",
    },
  });

  const style = {
    transition,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 ring-primary opacity-50 scale-105 transition-all duration-200",
        overlay: "ring-2 ring-primary shadow-lg scale-105",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4 flex items-center align-middle text-left whitespace-pre-wrap">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab hover:text-secondary-foreground/80 transition-colors">
          <span className="sr-only">Move car</span>
          <GripVertical />
        </Button>
        {car.content}
      </CardContent>
    </Card>
  );
}