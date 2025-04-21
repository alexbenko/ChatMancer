import { useSnackbar, VariantType } from 'notistack';
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";


const useNotification = () => {
    const [conf, setConf] = useState<{msg:string, variant: 'info' | 'error' | 'warn' | 'success'}>({
      msg: '',
      variant: 'info'
    });
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const action = (key:any) =>{
      return (
        <>
          <IconButton onClick={() => { closeSnackbar(key) }}>
              <DeleteIcon />
          </IconButton>
        </>
      )
    }

    useEffect(()=>{
      if(conf?.msg){
          let variant = 'info';
          if(conf.variant){
              variant = conf.variant;
          }
          enqueueSnackbar(conf.msg, {
              variant: variant as VariantType,
              autoHideDuration: 5000,
              preventDuplicate: true,
              action
          });
      }
    },[conf]);
  return setConf;
};

export default useNotification
