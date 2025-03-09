import * as React from "react";
import IconButton from "@mui/material/IconButton";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, styled, Typography, Button, Stack, Divider, Collapse } from "@mui/material";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import Preloader from "../Loader/PreLoader";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { replyEmail } from "@/utils/contactSlice";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { toast } from "react-toastify";

const RichTextEditor = dynamic(() => import("@mantine/rte"), {
  ssr: false,
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default function ReadEmailContent({ details }) {
  if (!details) {
    return <Preloader />;
  }
  
  if(details) {
    console.log(details.message);
  }
  
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [expandedReplies, setExpandedReplies] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    setLoading(true)
    const formData = new FormData();
    formData.append('message', message);
    formData.append('email', details.email);
    formData.append('id', details._id);
    
    try {
      const response = await dispatch(replyEmail(formData)).unwrap();
      if(response.statusCode === 200){
        setMessage("");
        toast.success(response.message);
        window.location.reload();
      }else{
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleClose();
      setLoading(false)
    }
  };

  const toggleReply = (index) => {
    setExpandedReplies(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  return (
    <>
      <Card sx={{ boxShadow: "none", borderRadius: "10px", p: "25px", mb: "15px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEF0F7", paddingBottom: "10px", mb: "20px" }}>
          <Typography as="h3" sx={{ fontSize: 15, fontWeight: 500 }}>{details.name} </Typography>
          <Box>
            <Tooltip title="Print">
              <IconButton size="small" sx={{ background: "#F2F6F8" }}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" sx={{ background: "#F2F6F8" }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Report Spam">
              <IconButton size="small" sx={{ background: "#F2F6F8" }}>
                <ErrorOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="h6" fontSize="14px">{details?.subject}</Typography>
          <Typography mb={2} style={{ whiteSpace: "pre-line" }}>{details?.message}</Typography>
        </Box>
        
        {/* Replies Section - Only render if replies exist */}
        {details.replies && details.replies.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 2 }}>
              {details.replies.length} {details.replies.length === 1 ? 'Reply' : 'Replies'}
            </Typography>
            
            {details.replies.map((email, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                {/* Clickable header for each reply */}
                <Box 
                  onClick={() => toggleReply(index)}
                  sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    p: 1,
                    cursor: "pointer",
                    borderRadius: "4px",
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, mr: 2 }}>
                      JVR SUPPORT TEAM
                    </Typography>
                    <Typography sx={{ 

                      fontSize: 12, 
                      color: 'text.secondary',
                      maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: expandedReplies[index] ? 'none' : 'block'
                    }}

                    dangerouslySetInnerHTML={{ 
                      __html: email.message ? `${email.message.substring(0, 60)}...` : ''
                    }}
                    
    
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mr: 1 }}>
                      { new Date(email.createdAt).toLocaleString() }
                    </Typography>
                    {expandedReplies[index] ? 
                      <KeyboardArrowUpIcon fontSize="small" /> : 
                      <KeyboardArrowDownIcon fontSize="small" />
                    }
                  </Box>
                </Box>
                
                {/* Collapsible content */}
                <Collapse in={expandedReplies[index]} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 1, py: 2, ml: 2, borderLeft: '2px solid #f0f0f0' }}>
                    <Typography style={{ whiteSpace: "pre-line", fontSize: 14 }} dangerouslySetInnerHTML={{ __html: email.message }}
                    />
                  </Box>
                </Collapse>
                
                {index < details.replies.length - 1 && (
                  <Divider sx={{ mt: 1 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
        
        <Stack direction="row" justifyContent="end" mt={2}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<ReplyIcon sx={{ color: "#fff !important" }} />}
            sx={{ borderRadius: '8px', textTransform: 'capitalize', color: "#fff !important" }}
            onClick={handleClickOpen}
          >
            Reply
          </Button>
        </Stack>
      </Card>

      {/* Reply Modal */}
      <BootstrapDialog open={open} onClose={handleClose}>
        <BootstrapDialogTitle onClose={handleClose}>Reply to Message</BootstrapDialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              id="email"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={details.email}
            />
            <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>Message:</Typography>
            <RichTextEditor 
              name={message} 
              value={message} 
              onChange={setMessage} 
              controls={[
                ["bold", "italic", "underline", "link"],
                ["unorderedList", "h1", "h2", "h3"],
                ["sup", "sub"],
                ["alignLeft", "alignCenter", "alignRight"],
              ]} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Cancel</Button>
            <Button type="submit" disabled={loading} color="primary" variant="contained">{loading ? 'Sending...' : 'Send'}</Button>
          </DialogActions>
        </form>
      </BootstrapDialog>
    </>
  );
}