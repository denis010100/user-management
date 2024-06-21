"use client"

import React, { useState, ChangeEvent, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Table, Switch, Input, Select, Pagination, message } from "antd"
import axios from "axios"
import type { ColumnsType } from "antd/es/table"

const { Search } = Input
const { Option } = Select

interface Task {
  userId: number
  id: number
  title: string
  completed: boolean
}

const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos")
  return data
}

const Tasks = () => {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null)
  const [filterTitle, setFilterTitle] = useState<string>("")
  const [filterOwner, setFilterOwner] = useState<string | null>(null)
  const [localTasks, setLocalTasks] = useState<Task[]>([])

  const {
    data: tasks,
    error,
    isLoading,
  } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks })

  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks)
    }
  }, [tasks])

  const handleStatusChange = (id: number, completed: boolean) => {
    setLocalTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, completed } : task))
    )
    message.success("Task status updated locally!")
  }

  const filteredTasks = localTasks
    .filter((task) =>
      filterStatus !== null && filterStatus !== undefined
        ? task.completed === filterStatus
        : true
    )
    .filter((task) => (filterTitle ? task.title.includes(filterTitle) : true))
    .filter((task) =>
      filterOwner ? task.userId === parseInt(filterOwner) : true
    )

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const columns: ColumnsType<Task> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className: "w-[5%]",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      className: "w-[75%]",
    },
    {
      title: "Owner",
      dataIndex: "userId",
      key: "userId",
      className: "w-[10%]",
    },
    {
      title: "Status",
      dataIndex: "completed",
      key: "completed",
      className: "w-[10%]",
      render: (completed, record) => (
        <Switch
          checked={completed}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-row gap-4 mb-8">
        <Search
          className="w-[200px]"
          placeholder="Filter by title"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterTitle(e.target.value)
          }
        />
        <Select
          className="w-[200px]"
          placeholder="Filter by status"
          onChange={(value: boolean | null) => setFilterStatus(value)}
          allowClear
          value={filterStatus}
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Not Completed</Option>
        </Select>
        <Input
          className="w-[200px]"
          placeholder="Filter by owner"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterOwner(e.target.value)
          }
        />
      </div>
      <Table
        dataSource={paginatedTasks}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        columns={columns}
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredTasks.length}
        onChange={(page: number) => setCurrentPage(page)}
        style={{ marginTop: "16px" }}
      />
    </div>
  )
}

export default Tasks
