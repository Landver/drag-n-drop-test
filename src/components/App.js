import { useState, useCallback } from 'react'
import { v4 as uniqid } from 'uuid'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import styles from './App.module.css'
import cx from 'classnames'

const App = () => {
  const [value, setValue] = useState('')

  // Mocking tasks data
  const [tasks, setTasks] = useState([
    { id: uniqid(), content: 'Contact clients for outstanding invoices' },
    { id: uniqid(), content: 'Pay expenses' },
    { id: uniqid(), content: 'Brainstorm ten blog post ideas' },
    { id: uniqid(), content: 'Create detailed project plan' },
    { id: uniqid(), content: 'Schedule an introductory call' },
  ])

  // Creating initial state of columns
  const [columns, setColumns] = useState({
    [uniqid()]: {
      name: 'Pending',
      tasks,
    },
    [uniqid()]: {
      name: 'Todo',
      tasks: [],
    },
    [uniqid()]: {
      name: 'In progress',
      tasks: [],
    },
    [uniqid()]: {
      name: 'Done',
      tasks: [],
    },
  })

  const [edit, setEdit] = useState(null)

  // Enter an edit mode on doubleclick
  const handleEdit = (e, item) => {
    setValue(item.content)
    setEdit(item.id)
  }

  // Save edited card on Enter press
  const handleKeyPress = useCallback((e, item) => {
    if (e.code === 'Enter') {
      setEdit(null)

      const newTasks = tasks.map(task => {
        if (task.id === item.id) task.content = e.target.value
      })

      setTasks(newTasks)
      setValue('')
    }

    if (e.code === 'Escape') setEdit(null)
  }, [])

  // Cancel editing if clicking on the page body
  const handleEditCancel = useCallback(e => {
    if (e.target.classList.contains(styles.main)) setEdit(null)
  }, [])

  // Handling main drag and drop event
  const handleDragEnd = (event, columns, setColumns) => {
    if (!event.destination) return
    const { source, destination } = event

    if (source.droppableId !== destination.droppableId) {
      // If we did not drop item in another column just bring it back to initial position
      const sourceColumn = columns[source.droppableId]
      const destColumn = columns[destination.droppableId]
      const sourceItems = [...sourceColumn.tasks]
      const destItems = [...destColumn.tasks]

      const [removed] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, removed)

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          tasks: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          tasks: destItems,
        },
      })
    } else {
      // If we dropped the item elsewhere - change it's location in tasks array
      const column = columns[source.droppableId]
      const copiedItems = [...column.tasks]

      const [removed] = copiedItems.splice(source.index, 1)
      copiedItems.splice(destination.index, 0, removed)

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          tasks: copiedItems,
        },
      })
    }
  }

  return (
    <div className={styles.main} onClick={e => handleEditCancel(e)}>
      <DragDropContext onDragEnd={event => handleDragEnd(event, columns, setColumns)}>
        {Object.entries(columns).map(([id, column]) => {
          // Object.entries: [23f7hh8-q234fh-483h9, { name: Polling, tasks: [{ id, content }, {}] }]
          return (
            <div key={id} className={styles.wrapper}>
              <h2>{column.name}</h2>
              <Droppable droppableId={id}>
                {(provided, snapshot) => {
                  return (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cx(styles.column, snapshot.isDraggingOver ? styles.drag : styles.noDrag)}
                    >
                      {column.tasks.map((item, i) => {
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={i}>
                            {(provided, snapshot) => {
                              return (
                                <div
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                  className={cx(
                                    styles.item,
                                    snapshot.isDragging ? styles.item_drag : styles.item_noDrag
                                  )}
                                  style={{ ...provided.draggableProps.style }}
                                  onDoubleClick={e => handleEdit(e, item)}
                                >
                                  {edit === item.id ? (
                                    <textarea
                                      className={styles.textarea}
                                      type="text"
                                      value={value}
                                      onChange={e => setValue(e.target.value)}
                                      onKeyPress={e => handleKeyPress(e, item)}
                                    />
                                  ) : (
                                    item.content
                                  )}
                                </div>
                              )
                            }}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )
                }}
              </Droppable>
            </div>
          )
        })}
      </DragDropContext>
    </div>
  )
}

export default App
