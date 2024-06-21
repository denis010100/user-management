"use client"

import React, { useState, ChangeEvent } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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

interface UpdateTaskStatusParams {
  id: number
  completed: boolean
}

const updateTaskStatus = async ({
  id,
  completed,
}: UpdateTaskStatusParams): Promise<void> => {
  await axios.patch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
    completed,
  })
}

const Tasks: React.FC = () => {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null)
  const [filterTitle, setFilterTitle] = useState<string>("")
  const [filterOwner, setFilterOwner] = useState<string | null>(null)

  const {
    data: tasks,
    error,
    isLoading,
  } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks })

  const mutation = useMutation<void, Error, UpdateTaskStatusParams>({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      message.success("Task status updated successfully!")
    },
    onError: () => {
      message.error("Failed to update task status.")
    },
  })

  const handleStatusChange = (id: number, completed: boolean) => {
    mutation.mutate({ id, completed })
  }

  const filteredTasks = tasks
    ? tasks
        .filter((task: Task) =>
          filterStatus !== null && filterStatus !== undefined
            ? task.completed === filterStatus
            : true
        )
        .filter((task: Task) =>
          filterTitle ? task.title.includes(filterTitle) : true
        )
        .filter((task: Task) =>
          filterOwner ? task.userId === parseInt(filterOwner) : true
        )
    : []

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const columns: ColumnsType<Task> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Owner",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Status",
      dataIndex: "completed",
      key: "completed",
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
      <div style={{ marginBottom: "16px" }}>
        <Search
          placeholder="Filter by title"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterTitle(e.target.value)
          }
          style={{ width: 200, marginRight: "8px" }}
        />
        <Select
          placeholder="Filter by status"
          onChange={(value: boolean | null) => setFilterStatus(value)}
          style={{ width: 200, marginRight: "8px" }}
          allowClear
          value={filterStatus}
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Not Completed</Option>
        </Select>
        <Input
          placeholder="Filter by owner"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterOwner(e.target.value)
          }
          style={{ width: 200 }}
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
