import { IconButton } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import useNotification from "../hooks/useNotification";

const Answer = ({answer}: {answer: string})=> {
  const sendNotification = useNotification();

  const copyToClipboard = async () =>{
    try {
      await navigator.clipboard.writeText(answer)
      sendNotification({msg: 'Answer copied to clipboard!', variant: 'info'})
    } catch(e) {
      console.log(e)
      sendNotification({msg: 'Failed to Copy to clipboard!', variant: 'error'})
    }
  }

  return (
    <>
      <div >
        <h2>Answer:</h2>
        <IconButton onClick={copyToClipboard} color="primary">
          <FileCopyIcon />
        </IconButton>
      </div>

      <div>{answer}</div>
    </>
  )
}
export default Answer
