import React, { useState, useEffect, createContext } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Amplify, { Auth } from "aws-amplify"
import { AmplifyAuthenticator, AmplifySignUp } from "@aws-amplify/ui-react"
import awsconfig from "./aws-exports"

import Wrapper from "./components/layouts/Wrapper"
import PostList from "./components/post/PostList"

import { User } from "./types/index"

export const UserContext = createContext({} as {
  currentUser: User | undefined
  setCurrentUser: React.Dispatch<React.SetStateAction<User | undefined>>
})

Amplify.configure(awsconfig)

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>()

  const getCurrentUser = async () => {
    const currentUserInfo = await Auth.currentUserInfo()
    setCurrentUser(currentUserInfo)
  }

  useEffect(() => {
    getCurrentUser()
  }, [])

  return (
    <AmplifyAuthenticator>
      <AmplifySignUp
        slot="sign-up"
        formFields={[
          { type: "username" },
          { type: "email" },
          { type: "password" }
        ]}
      >
      </AmplifySignUp>
      <Router>
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
          <Wrapper>
            <Switch>
              <Route exact path="/" component={PostList} />
            </Switch>
          </Wrapper>
        </UserContext.Provider>
      </Router>
    </AmplifyAuthenticator>
  )
}

export default App