import React, { useCallback, useState, useContext } from "react"

import { experimentalStyled as styled } from "@mui/material/styles"
import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import CreateIcon from "@mui/icons-material/Create"
import CancelIcon from "@mui/icons-material/Cancel"

import API, { graphqlOperation } from "@aws-amplify/api"
import { createPost } from "../../graphql/mutations"
import { v4 as uuid } from "uuid"
import awsconfig from "../../aws-exports"
import { Storage } from "aws-amplify"
import { CreatePostInput, PostStatus } from "../../types/index"

import { UserContext } from "../../App"

// S3のバケット名などを取得
const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = awsconfig

const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: "flex",
    flexWrap: "wrap",
    width: 320
  },
  inputFileBtn: {
    marginTop: "10px"
  },
  submitBtn: {
    marginTop: "10px",
    marginLeft: "auto"
  },
  box: {
    margin: "2rem 0 4rem",
    width: 320
  },
  preview: {
    width: "100%"
  }
}))

const Input = styled("input")({
  display: "none"
})

const borderStyles = {
  bgcolor: "background.paper",
  border: 1,
}

const PostForm: React.FC = () => {
  const { currentUser } = useContext(UserContext)

  const classes = useStyles()

  const [content, setContent] = useState<string>("")
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState<string>("")

  const uploadImage = useCallback((e) => {
    const file = e.target.files[0]
    setFile(file)
  }, [])

  // 画像プレビュー機能
  const previewImage = useCallback((e) => {
    const file = e.target.files[0]
    setPreview(window.URL.createObjectURL(file))
  }, [])

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!content) return

    const data: CreatePostInput = {
      content: content,
      owner: currentUser?.attributes.sub,
      status: PostStatus.published
    }

    if (file) {
      const { name: fileName, type: mimeType } = file
      const key: string = `images/${uuid()}_${fileName}`
      // 最終的な保存先
      const imageUrl: string = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`

      try {
        await Storage.put(key, file, {
          contentType: mimeType
        })

        data.image = imageUrl
        setFile(undefined)
      } catch (err: any) {
        console.log(err)
      }
    }

    try {
      await API.graphql(graphqlOperation(createPost, { input: data }))
      setContent("")
      setPreview("")
    } catch (err: any) {
      console.log(err)
    }
  }

  return (
    <>
      <form className={classes.form} noValidate onSubmit={handleCreatePost}>
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
        <div className={classes.inputFileBtn}>
          <label htmlFor="icon-button-file">
            <Input
              accept="image/*"
              id="icon-button-file" 
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                uploadImage(e)
                previewImage(e)
              }}
            />
            <IconButton color="inherit" component="span">
              <PhotoCameraIcon />
            </IconButton>
          </label>
        </div>
        <div className={classes.submitBtn}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            color="inherit"
            disabled={!content || content.length > 140}
            startIcon={<CreateIcon />}
            className={classes.submitBtn}
          >
            Post
          </Button>
        </div>
      </form>
      { preview ?
        <Box
          sx={{ ...borderStyles, borderRadius: 1, borderColor: "grey.400" }}
          className={classes.box}
        >
          <IconButton
            color="inherit"
            onClick={() => setPreview("")}
          >
            <CancelIcon />
          </IconButton>
          <img
            src={preview}
            alt="preview-img"
            className={classes.preview}
          />
        </Box> : null
      }
    </>
  )
}

export default PostForm