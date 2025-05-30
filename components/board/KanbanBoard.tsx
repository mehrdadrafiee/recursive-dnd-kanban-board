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
import { Column, BoardColumn, BoardContainer, ColumnDragData } from "./BoardColumn";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { Car, CarCard, CarDragData } from "./CarCard";

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

const initialCars: Car[] = [
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
  const [columns, setColumns] = useState<NestedColumn[]>(defaultCols);
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeCar, setActiveCar] = useState<Car | null>(null);
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
    data: DataRef<CarDragData | ColumnDragData>;
  } => {
    if (!entry) {
      return false;
    }

    const data = entry.data.current;

    if (data?.type === "Column" || data?.type === "Car") {
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
      const carsInColumn = cars.filter((car) => car.columnId === col.id);

      if (col.children && col.children.length > 0) {
        return (
          <div key={col.id} className="flex flex-col">
            {carsInColumn.length > 0 && <BoardColumn column={col} cars={carsInColumn} />}
            <div className={carsInColumn.length > 0 ? "ml-4 mt-2" : ""}>
              {renderNestedColumns(col.children)}
            </div>
          </div>
        );
      } else {
        return <BoardColumn key={col.id} column={col} cars={carsInColumn} />;
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

    if (data?.type === "Car") {
      setActiveCar(data.car);
      return;
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveCar(null);

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
    } else if (activeData?.type === "Car") {
      const newColumnId = hasDraggableData(over)
        ? over.data.current?.type === "Column"
          ? over.id as ColumnId
          : over.data.current?.car.columnId
        : over.id as ColumnId;

      const oldColumnId = activeData.car.columnId;

      if (oldColumnId !== newColumnId) {
        setCars((cars) => {
          return cars.map((car) =>
            car.id === activeId && newColumnId ? { ...car, columnId: newColumnId } : car
          );
        });
      } else {
        setCars((cars) => {
          const oldIndex = cars.findIndex((car) => car.id === activeId);
          const newIndex = cars.findIndex((car) => car.id === overId);
          return arrayMove(cars, oldIndex, newIndex);
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

    const isActiveACar = activeData?.type === "Car";
    const isOverACar = overData?.type === "Car";

    if (!isActiveACar) return;

    if (isActiveACar && isOverACar) {
      setCars((cars) => {
        const activeIndex = cars.findIndex((car) => car.id === activeId);
        const overIndex = cars.findIndex((car) => car.id === overId);
        const activeCar = cars[activeIndex];
        const overCar = cars[overIndex];
        if (activeCar && overCar && activeCar.columnId !== overCar.columnId) {
          activeCar.columnId = overCar.columnId;
          return arrayMove(cars, activeIndex, overIndex - 1);
        }

        return arrayMove(cars, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    if (isActiveACar && isOverAColumn) {
      setCars((cars) => {
        const activeIndex = cars.findIndex((car) => car.id === activeId);
        const activeCar = cars[activeIndex];
        if (activeCar) {
          activeCar.columnId = overId as ColumnId;
          return arrayMove(cars, activeIndex, activeIndex);
        }
        return cars;
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
                column={activeColumn}
                cars={cars.filter((car) => car.columnId === activeColumn.id)}
                isOverlay
              />
            )}
            {activeCar && <CarCard car={activeCar} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}