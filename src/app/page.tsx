"use client"

import axios from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CollapseProps } from "antd"
import { Button, Collapse, Form, Input, message } from "antd"
import { useState } from "react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { setUser } from "@/lib/features/users/usersSlice"

const fetchUsers = async () => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/users")
  return data.slice(0, 10)
}

const updateUser = async ({ id, data }: { id: string; data: any }) => {
  const transformedData = {
    ...data,
    address: {
      street: data.street,
      suite: data.suite,
      city: data.city,
    },
  }
  delete transformedData.street
  delete transformedData.suite
  delete transformedData.city

  const response = await axios.patch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    transformedData
  )
  return response.data
}

export default function Home() {
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeKey, setActiveKey] = useState<string | string[]>("")
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      message.success("User updated successfully")
      setIsFormChanged(false)
    },
    onError: (error: any) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const handleCollapseChange = (key: string | string[]) => {
    setActiveKey(key[0])
    const user = data?.find((u: any) => u.id.toString() === key[0])

    if (user) {
      setCurrentUser(user)
      form.resetFields()
      form.setFieldsValue(user)
      setIsFormChanged(false)
      dispatch(setUser(user))
    }
  }

  const handleFormChange = (changedValues: any, allValues: any) => {
    if (currentUser) {
      const isChanged = Object.keys(changedValues).some((key) => {
        if (key === "street" || key === "suite" || key === "city") {
          return changedValues[key] !== currentUser.address[key]
        }
        return changedValues[key] !== currentUser[key]
      })
      setIsFormChanged(isChanged)
    }
  }

  const handleFormSubmit = (values: any) => {
    if (currentUser) {
      mutation.mutate({ id: currentUser.id, data: values })
    }
  }

  const items: CollapseProps["items"] = data?.map((user: any) => ({
    key: user.id.toString(),
    label: user.name,
    children: (
      <div className="flex flex-col gap-4 text-lg">
        <Form
          style={{ width: "30%" }}
          onValuesChange={handleFormChange}
          onFinish={handleFormSubmit}
          layout="vertical"
          form={form}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Please enter a valid email",
              },
            ]}
            label="Email"
            name="email"
          >
            <Input />
          </Form.Item>
          <Form.Item
            tooltip={
              "Formats are as follows 123-456-7890 (123) 456-7890 123 456 7890 123.456.7890 +91 (123) 456-7890"
            }
            rules={[
              {
                pattern: /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
                message: "Please enter a valid phone number",
              },
            ]}
            label="Phone"
            name="phone"
          >
            <Input />
          </Form.Item>
          <Form.Item label="Website" name="website">
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
            label="Username"
            name="username"
          >
            <Input />
          </Form.Item>
          <Form.Item label="Website" name="website">
            <Input />
          </Form.Item>
          <Form.Item
            initialValue={currentUser?.address?.street}
            rules={[
              {
                required: true,
                message: "Please input your address street!",
              },
            ]}
            label="Address Street"
            name={["street"]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            initialValue={currentUser?.address?.suite}
            rules={[
              {
                required: true,
                message: "Please input your address suite!",
              },
            ]}
            label="Address Suite"
            name={["suite"]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            initialValue={currentUser?.address?.city}
            rules={[
              {
                required: true,
                message: "Please input your address city!",
              },
            ]}
            label="Address City"
            name={["city"]}
          >
            <Input />
          </Form.Item>
          <div className="flex flex-row gap-6">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isFormChanged}
              >
                Submit
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                onClick={() => {
                  form.resetFields()
                  form.setFieldsValue(currentUser)
                  setIsFormChanged(false)
                }}
                danger
                disabled={!isFormChanged}
              >
                Cancel
              </Button>
            </Form.Item>
          </div>
        </Form>
        <div>
          <Link href={`user/${user.id}/posts`}>
            <Button>See posts 🔎</Button>
          </Link>
        </div>
      </div>
    ),
  }))

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {error.message}</div>

  return (
    <div>
      <Collapse
        activeKey={activeKey}
        onChange={handleCollapseChange}
        accordion
        items={items}
      />
    </div>
  )
}
