import React, { useState, useEffect, useContext } from "react"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import clsx from "clsx"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardMedia from "@mui/material/CardMedia"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Avatar from "@mui/material/Avatar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import FavoriteIcon from "@mui/icons-material/Favorite"
import ShareIcon from "@mui/icons-material/Share"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Collapse from "@mui/material/Collapse"

import API, { graphqlOperation } from "@aws-amplify/api"
import { deletePost } from "../../graphql/mutations"

import { UserContext } from "../../App"
import {
  Post,
  Comment,
  OnCreateCommentSubscriptionData,
  OnDeleteCommentSubscriptionData
} from "../../types/index"

import { onCreateComment, onDeleteComment } from "../../graphql/subscriptions"

import CommentForm from "./CommentForm"
import CommentItem from "./CommentItem"

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    width: 320,
    marginTop: "2rem",
    transition: "all 0.3s",
    "&:hover": {
      boxShadow:
        "1px 0px 20px -1px rgba(0,0,0,0.2), 0px 0px 20px 5px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
      transform: "translateY(-3px)"
    }
  },
  deleteBtn: {
    marginLeft: "auto"
  },
  expandBtn: {
    marginLeft: "auto"
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    /*
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
    */
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
}))

type PostItemProps = {
  post: Post
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const { currentUser } = useContext(UserContext)

  const classes = useStyles()

  const [likes, setLikes] = useState<boolean>(false)
  const [comments, setComments] = useState<(Comment | null)[] | null | undefined>([])
  const [expanded, setExpanded] = useState(false)

  const handleDeletePost = async (id: string | undefined) => {
    if (!id) return

    try {
      await API.graphql(graphqlOperation(deletePost, { input: { id: id } }))
    } catch (err: any) {
      console.log(err)
    }
  }

  const getComments = () => {
    setComments(post.comments?.items)
  }

  const subscribeCreatedComment = () => {
    const client = API.graphql(graphqlOperation(onCreateComment))

    if ("subscribe" in client) {
      client.subscribe({
        next: ({ value: { data } }: OnCreateCommentSubscriptionData) => {
          if (data.onCreateComment) {
            const createdComment: Comment = data.onCreateComment
            setComments((prev) => prev?.length? [createdComment, ...prev] : [createdComment, ...[]])
          }
        }
      })
    }
  }

  const subscribeDeletedComment = () => {
    const client = API.graphql(graphqlOperation(onDeleteComment))

    if ("subscribe" in client) {
      client.subscribe({
        next: ({ value: { data } }: OnDeleteCommentSubscriptionData) => {
          if (data.onDeleteComment) {
            const deletedComment: Comment = data.onDeleteComment
            setComments((prev) => prev?.filter((comment) => comment?.id !== deletedComment.id))
          }
        }
      })
    }
  }

  useEffect(() => {
    getComments()
    subscribeCreatedComment()
    subscribeDeletedComment()
  }, [])

  return (
    <>
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar>
              U
            </Avatar>
          }
          // 投稿主と認証済みユーザーが一致する場合に削除ボタンを表示
          action={post.owner === currentUser?.attributes.sub ?
            <div className={classes.deleteBtn}>
              <IconButton
                onClick={() => handleDeletePost(post.id)}
              >
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </div> : null
          }
          title={currentUser?.username}
        />
        { post.image ?
          <CardMedia
            component="img"
            src={post.image}
            alt="post-img"
          /> : null
        }
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="span">
            { post.content?.split("\n").map((content: string, index: number) => {
                return (
                  <p key={index}>{content}</p>
                )
              })
            }
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          {
            likes ?
              <IconButton onClick={() => setLikes(false)}>
                <FavoriteIcon />
              </IconButton>
                :
              <IconButton onClick={(e) => setLikes(true)}>
                <FavoriteBorderIcon />
              </IconButton>
          }
          <IconButton>
            <ShareIcon />
          </IconButton>
          <div className={classes.expandBtn}>
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </div>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <CommentForm
              postId={post?.id}
            />
            { comments?.map((comment) => {
              return (
                <CommentItem
                  key={comment?.id}
                  comment={comment}
                />
              )}
            )}
          </CardContent>
        </Collapse>
      </Card>
    </>
  )
}

export default PostItem