import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import userEvent from "@testing-library/user-event"
import { userReducer } from "../lib/features/users/usersSlice"
import Home from "./page"

const mockUsers = [
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "address": {
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "city": "Gwenborough",
      "zipcode": "92998-3874",
      "geo": {
        "lat": "-37.3159",
        "lng": "81.1496"
      }
    },
    "phone": "1-770-736-8031 x56442",
    "website": "hildegard.org",
    "company": {
      "name": "Romaguera-Crona",
      "catchPhrase": "Multi-layered client-server neural-net",
      "bs": "harness real-time e-markets"
    }
  },
  {
    "id": 2,
    "name": "Ervin Howell",
    "username": "Antonette",
    "email": "Shanna@melissa.tv",
    "address": {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": "-43.9509",
        "lng": "-34.4618"
      }
    },
    "phone": "010-692-6593 x09125",
    "website": "anastasia.net",
    "company": {
      "name": "Deckow-Crist",
      "catchPhrase": "Proactive didactic contingency",
      "bs": "synergize scalable supply-chains"
    }
  },
]

const queryClient = new QueryClient()

const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

describe("Home component", () => {
  beforeEach(() => {
    queryClient.clear()
    queryClient.setQueryData(["users"], mockUsers)
  })

  test("renders user data and form", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Home />
        </Provider>
      </QueryClientProvider>
    )

    expect(screen.getByText("Leanne Graham")).toBeInTheDocument()
    expect(screen.getByText("Ervin Howell")).toBeInTheDocument()
  })

  test("allows user to edit and submit form", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Home />
        </Provider>
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByText("Ervin Howell"))

    const nameInput = screen.getByLabelText("Name")
    userEvent.clear(nameInput)
    userEvent.type(nameInput, "New User 1")

    const submitButton = screen.getByText("Submit")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText("User updated successfully")).not.toBeInTheDocument();
    });
  })
})
