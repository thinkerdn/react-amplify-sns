import React, { useState, useContext } from "react"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined"

import API, { graphqlOperation } from "@aws-amplify/api"
import { createComment } from "../../graphql/mutations"
import { CreateCommentInput } from "../../types/index"

import { UserContext } from "../../App"


const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%"
  },
  submitBtn: {
    marginTop: "10px",
    marginLeft: "auto"
  }
}))

type CommentFormProps = {
  postId: string | undefined
}

const CommentForm: React.FC<CommentFormProps> = ({ postId }) => {
  const { currentUser } = useContext(UserContext)

  const classes = useStyles()

  const [content, setContent] = useState<string>("")

  const handleCreateComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!content) return

    const data: CreateCommentInput = {
      postId: postId,
      content: content,
      owner: currentUser?.attributes.sub
    }

    try {
      await API.graphql(graphqlOperation(createComment, { input: data }))
      setContent("")
    } catch (err: any) {
      console.log(err)
    }
  }

  return (
    <>
      <form className={classes.form} noValidate onSubmit={handleCreateComment}>
        <TextField
          placeholder="Hello World!"
          variant="outlined"
          multiline
          fullWidth
          rows="4"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setContent(e.target.value)
          }}
        />
        <div className={classes.submitBtn}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            color="inherit"
            disabled={!content || content.length > 140}
            startIcon={<SmsOutlinedIcon />}
            className={classes.submitBtn}
          >
            Comment
          </Button>
        </div>
      </form>
    </>
  )
}

export default CommentForm