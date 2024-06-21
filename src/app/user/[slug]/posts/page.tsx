"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Collapse,
  CollapseProps,
  Form,
  Input,
  Modal,
  message,
} from "antd"
import axios from "axios"
import { useEffect, useState } from "react"

const updateUser = async ({ id, data }: { id: string; data: any }) => {
  console.log(data)
  const transformedData = {
    ...data,
    address: {
      street: data.street,
      suite: data.suite,
      city: data.city,
    },
  }
  console.log(transformedData)
  delete transformedData.street
  delete transformedData.suite
  delete transformedData.city

  const response = await axios.patch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    transformedData
  )
  return response.data
}

const deletePost = async ({ id }: { id: string }) => {
  const response = await axios.delete(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  )
  return response.data
}

export default function Page({
  params: { slug },
}: {
  params: { slug: string }
}) {
  const fetchUser = async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${slug}`
    )
    return data
  }

  const fetchUserPosts = async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${slug}/posts`
    )
    return data
  }

  const [form] = Form.useForm()
  const [postForm] = Form.useForm()
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [isPostFormChanged, setIsPostFormChanged] = useState(false)
  const queryClient = useQueryClient()
  const [activeKey, setActiveKey] = useState<string | string[]>("")
  const [currentPost, setCurrentPost] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localUserPosts, setLocalUserPosts] = useState([])

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ["users", slug],
    queryFn: fetchUser,
  })

  const {
    data: userPosts,
    error: postsError,
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ["userPosts", slug],
    queryFn: fetchUserPosts,
  })

  useEffect(() => {
    if (userPosts) {
      setLocalUserPosts(userPosts)
    }
  }, [userPosts])

  const userMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", slug] })
      message.success("User updated successfully")
      setIsFormChanged(false)
    },
    onError: (error) => {
      message.error(`Error: ${error.message}`)
    },
  })

  const postDeleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (data, variables) => {
      setLocalUserPosts((prevPosts) =>
        prevPosts.filter((post: any) => post.id.toString() !== variables.id)
      )
      message.success("Post deleted successfully")
      setIsModalOpen(false)
    },
    onError: (error) => {
      message.error(`Error: ${error.message}`)
    },
  })

  useEffect(() => {
    form.setFieldsValue(userData)
  }, [userData, form])

  const handleFormChange = (changedValues: any) => {
    if (userData) {
      const isChanged = Object.keys(changedValues).some((key) => {
        if (key === "street" || key === "suite" || key === "city") {
          return changedValues[key] !== userData.address[key]
        }
        return changedValues[key] !== userData[key]
      })
      setIsFormChanged(isChanged)
    }
  }

  const handlePostFormChange = (changedValues: any) => {
    if (currentPost) {
      const isChanged = Object.keys(changedValues).some((key) => {
        return changedValues[key] !== currentPost[key]
      })
      setIsPostFormChanged(isChanged)
    }
  }

  const handleFormSubmit = (values: any) => {
    console.log(values)
    if (userData) {
      userMutation.mutate({ id: userData.id, data: userData })
    }
  }

  const handlePostFormSubmit = (values: any) => {
    if (currentPost) {
      userMutation.mutate({ id: userData.id, data: values })
    }
  }

  const handleCollapseChange = (key: string | string[]) => {
    setActiveKey(key[0])
    const post = localUserPosts?.find((u: any) => u.id.toString() === key[0])

    if (post) {
      setCurrentPost(post)
      postForm.resetFields()
      postForm.setFieldsValue(post)
      setIsPostFormChanged(false)
    }
  }

  const items: CollapseProps["items"] = localUserPosts?.map((post: any) => ({
    key: post.id.toString(),
    label: post.title,
    children: (
      <div className="flex flex-col gap-4 text-lg">
        <Form
          style={{ width: "100%" }}
          onValuesChange={handlePostFormChange}
          onFinish={handlePostFormSubmit}
          layout="vertical"
          form={postForm}
        >
          <Form.Item label="Title" name="title">
            <Input />
          </Form.Item>

          <Form.Item label="Body" name="body">
            <Input.TextArea />
          </Form.Item>
          <div className="flex flex-row gap-6">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isPostFormChanged}
              >
                Submit
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                onClick={() => {
                  postForm.resetFields()
                  postForm.setFieldsValue(localUserPosts)
                  setIsPostFormChanged(false)
                }}
                danger
                disabled={!isFormChanged}
              >
                Cancel
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={() => setIsModalOpen(true)} danger>
                Delete
              </Button>
              <Modal
                title="Delete Post"
                open={isModalOpen}
                onOk={() =>
                  postDeleteMutation.mutate({ id: post.id.toString() })
                }
                onCancel={handleCancel}
              >
                <p>Are you sure you want to delete this post?</p>
              </Modal>
            </Form.Item>
          </div>
        </Form>
      </div>
    ),
  }))

  if (userLoading || postsLoading) return <div>Loading...</div>
  if (userError !== null && postsError !== null)
    return (
      <div>
        An error occurred: {userError.toString() || postsError.toString()}
      </div>
    )

  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl">User Details</h1>
      <div className="flex flex-col gap-4 text-lg bg-gray-100 p-5 rounded-lg">
        <Form
          onValuesChange={handleFormChange}
          onFinish={handleFormSubmit}
          form={form}
          layout="vertical"
          size="large"
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <Form.Item
              colon={false}
              style={{ flex: "1 0 45%" }}
              label="Name"
              name="name"
            >
              <Input />
            </Form.Item>
            <Form.Item
              style={{ flex: "1 0 45%" }}
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
            <Form.Item style={{ flex: "1 0 45%" }} label="Phone" name="phone">
              <Input />
            </Form.Item>
            <Form.Item
              style={{ flex: "1 0 45%" }}
              label="Website"
              name="website"
            >
              <Input />
            </Form.Item>
            <Form.Item
              style={{ flex: "1 0 45%" }}
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
            <Form.Item
              style={{ flex: "1 0 45%" }}
              initialValue={userData.address?.street}
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
              style={{ flex: "1 0 45%" }}
              initialValue={userData.address?.suite}
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
              style={{ flex: "1 0 45%" }}
              initialValue={userData.address?.city}
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
          </div>
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
                  form.setFieldsValue(userData)
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
      </div>
      <h1 className="text-4xl">User Posts</h1>
      <div className="w-1/2">
        <Collapse
          activeKey={activeKey}
          onChange={handleCollapseChange}
          accordion
          items={items}
        />
      </div>
    </div>
  )
}
