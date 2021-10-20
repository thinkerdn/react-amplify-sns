import React, { useContext } from "react"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import Avatar from "@mui/material/Avatar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"

import API, { graphqlOperation } from "@aws-amplify/api"
import { deleteComment } from "../../graphql/mutations"

import { UserContext } from "../../App"
import { Comment } from "../../types/index"

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    width: "100%",
    marginTop: "2rem",
    transition: "all 0.3s",
    "&:hover": {
      boxShadow:
        "1px 0px 20px -1px rgba(0,0,0,0.2), 0px 0px 20px 5px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
      transform: "translateY(-3px)"
    }
  },
  delete: {
    marginLeft: "auto"
  }
}))

type CommentItemProps = {
  comment: Comment | null
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { currentUser } = useContext(UserContext)

  const classes = useStyles()

  const handleDeleteComment = async (id: string | undefined) => {
    if (!id) return

    try {
      await API.graphql(graphqlOperation(deleteComment, { input: { id: id } }))
    } catch (err: any) {
      console.log(err)
    }
  }

  return (
    <>
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar>
              U
            </Avatar>
          }
          action={comment?.owner === currentUser?.attributes.sub ?
            <div className={classes.delete}>
              <IconButton
                onClick={() => handleDeleteComment(comment?.id)}
              >
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </div> : null
          }
          title={currentUser?.username}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="span">
            { comment?.content?.split("\n").map((content: string, index: number) => {
                return (
                  <p key={index}>{content}</p>
                )
              })
            }
          </Typography>
        </CardContent>
      </Card>
    </>
  )
}

export default CommentItem