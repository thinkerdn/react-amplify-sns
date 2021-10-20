import React, { useContext } from "react"
import { Link } from "react-router-dom"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Box from "@mui/material/Box"

import { Auth } from "aws-amplify"

import { UserContext } from "../../App"

const useStyles = makeStyles((theme: Theme) => ({
  iconButton: {
    marginRight: 2, // theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    textDecoration: "none",
    color: "inherit"
  },
  box: {
    marginTop: "2rem",
    width: 320
  }
}))

const Header: React.FC = () => {
  const { setCurrentUser } = useContext(UserContext)

  const classes = useStyles()

  // サインアウトボタンを設置
  const signout = () => {
    Auth.signOut().catch((err: any) => console.log(err))
    setCurrentUser(undefined)
  }

  return (
    <>
    <Box className={classes.box} textAlign="center">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.iconButton}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            className={classes.title}
          >
            Sample
          </Typography>
          <Button
            onClick={signout}
            color="inherit"
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
    </>
  )
}

export default Header