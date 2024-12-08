import { useCallback, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  Active,
  Over,
  DataRef,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { type Task, TaskCard, TaskDragData } from "./TaskCard";
import { type Column, BoardColumn, BoardContainer, ColumnDragData } from "./BoardColumn";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";

type NestedColumn = Column & {
  children?: NestedColumn[];
};

const defaultCols: NestedColumn[] = [
  {
    id: "list-of-cars",
    title: "List of Cars"
  },
  {
    id: "american-cars",
    title: "American Cars"
  },
  {
    id: "european-cars",
    title: "European Cars",
    children: [
      { id: "german-cars", title: "German Cars" },
      { id: "italian-cars", title: "Italian Cars" },
      { id: "swedish-cars", title: "Swedish Cars" }
    ]
  },
  {
    id: "asian-cars",
    title: "Asian Cars",
    children: [
      { id: "japanese-cars", title: "Japanese Cars" },
      { id: "korean-cars", title: "Korean Cars" }
    ]
  }
];

export type ColumnId = (typeof defaultCols)[number]["id"];

const initialTasks: Task[] = [
  {
    id: "mb",
    columnId: "german-cars",
    content: "Mercedes Benz",
  },
  {
    id: "vw",
    columnId: "list-of-cars",
    content: "VW",
  },
  {
    id: "toyota",
    columnId: "japanese-cars",
    content: "Toyota",
  },
  {
    id: "honda",
    columnId: "korean-cars",
    content: "Honda",
  },
  {
    id: "ford",
    columnId: "list-of-cars",
    content: "Ford",
  },
  {
    id: "ferrari",
    columnId: "list-of-cars",
    content: "Ferrari",
  },
  {
    id: "bmw",
    columnId: "german-cars",
    content: "BMW",
  },
  {
    id: "porsche",
    columnId: "list-of-cars",
    content: "Porsche",
  },
  {
    id: "audi",
    columnId: "list-of-cars",
    content: "Audi",
  },
  {
    id: "nissan",
    columnId: "list-of-cars",
    content: "Nissan",
  },
  {
    id: "tesla",
    columnId: "american-cars",
    content: "Tesla",
  },
  {
    id: "chevrolet",
    columnId: "american-cars",
    content: "Chevrolet",
  },
  {
    id: "lamborghini",
    columnId: "italian-cars",
    content: "Lamborghini",
  },
  {
    id: "volvo",
    columnId: "swedish-cars",
    content: "Volvo",
  }
];

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dndContextId = useId();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  const hasDraggableData = <T extends Active | Over>(
    entry: T | null | undefined
  ): entry is T & {
    data: DataRef<TaskDragData | ColumnDragData>;
  } => {
    if (!entry) {
      return false;
    }

    const data = entry.data.current;

    if (data?.type === "Column" || data?.type === "Task") {
      return true;
    }

    return false;
  };

  // Helper function to flatten nested columns
  const flattenColumns = useCallback((cols: NestedColumn[]): Column[] => {
    return cols.flatMap((col) =>
      col.children ? [{ id: col.id, title: col.title }, ...flattenColumns(col.children)] : [col]
    );
  }, []);

  const flatColumns = useMemo(() => flattenColumns(columns), [columns, flattenColumns]);
  const columnsId = useMemo(() => flatColumns.map((col) => col.id), [flatColumns]);

  // recursively render nested columns
  const renderNestedColumns = (cols: NestedColumn[]) => {
    return cols.map((col) => {
      const tasksInColumn = tasks.filter((task) => task.columnId === col.id);

      if (col.children && col.children.length > 0) {
        // If the column has children, only render it if it has tasks directly assigned
        return (
          <div key={col.id} className="flex flex-col">
            {tasksInColumn.length > 0 && <BoardColumn column={col} tasks={tasksInColumn} />}
            <div className={tasksInColumn.length > 0 ? "ml-4 mt-2" : ""}>
              {renderNestedColumns(col.children)}
            </div>
          </div>
        );
      } else {
        // If it's a leaf node, always render it
        return <BoardColumn key={col.id} column={col} tasks={tasksInColumn} />;
      }
    });
  };

  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (isActiveAColumn) {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);
        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      });
    } else if (activeData?.type === "Task") {
      // Handle task movement
      const newColumnId = hasDraggableData(over)
        ? over.data.current?.type === "Column"
          ? (over.id as ColumnId)
          : (over.data.current as TaskDragData).task.columnId
        : (over.id as ColumnId);

      const oldColumnId = activeData.task.columnId;

      if (oldColumnId !== newColumnId) {
        // Update the task's columnId in the local state
        setTasks((tasks) => {
          return tasks.map((task) =>
            task.id === activeId ? { ...task, columnId: newColumnId } : task
          );
        });
      }
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
          activeTask.columnId = overTask.columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.columnId = overId as ColumnId;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}>
      <BoardContainer>
        <SortableContext items={columnsId}>
          {renderNestedColumns(columns)}
        </SortableContext>
      </BoardContainer>

      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}