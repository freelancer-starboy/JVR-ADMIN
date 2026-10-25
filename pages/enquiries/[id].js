import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RichTextEditor from "@/components/common/RichTextEditor";
import { ErrorState } from "@/components/common/States";
import { errorMessage } from "@/utils/api/baseApi";
import {
  useDeleteContactMutation,
  useGetContactQuery,
  useReplyToContactMutation,
  useSetContactReadMutation,
} from "@/utils/api/ContactsApi";
import { formatDate, initials, whatsappLink } from "@/utils/format";

export default function EnquiryDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, error, refetch } = useGetContactQuery(id, { skip: !id, refetchOnMountOrArgChange: true });
  const [setRead] = useSetContactReadMutation();
  const [sendReply, { isLoading: sending }] = useReplyToContactMutation();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();
  const [reply, setReply] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const markedRead = useRef(null);

  const contact = data?.contactDetails;
  const replies = contact?.replies || [];
  const waLink = whatsappLink(contact?.phoneNumber);

  // Opening an unread enquiry marks it as read
  useEffect(() => {
    if (contact && !contact.isOpened && markedRead.current !== contact._id) {
      markedRead.current = contact._id;
      setRead({ id: contact._id, read: true });
    }
  }, [contact, setRead]);

  const handleSend = async () => {
    if (!reply.replace(/<[^>]*>/g, "").trim()) {
      toast.warn("Write a reply first");
      return;
    }
    try {
      await sendReply({ id, message: reply }).unwrap();
      toast.success(`Reply sent to ${contact.email}`);
      setReply("");
    } catch (err) {
      toast.error(errorMessage(err, "Could not send the reply"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContact(id).unwrap();
      toast.success("Enquiry deleted");
      router.replace("/enquiries");
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the enquiry"));
    }
  };

  const markUnread = async () => {
    try {
      await setRead({ id, read: false }).unwrap();
      toast.info("Marked as unread");
      router.push("/enquiries");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title={contact?.subject || "Enquiry"}
        documentTitle="Enquiry"
        breadcrumbs={[{ label: "Enquiries", href: "/enquiries" }, { label: contact?.name || "Message" }]}
        actions={
          contact && (
            <>
              <Button color="inherit" startIcon={<MarkEmailUnreadOutlinedIcon />} onClick={markUnread}>
                Mark unread
              </Button>
              <Button color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </>
          )
        }
      />

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this enquiry" />
        </Card>
      ) : isLoading || !contact ? (
        <Skeleton variant="rounded" height={320} />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>{initials(contact.name)}</Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="subtitle2">{contact.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {contact.email}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(contact.createdAt, { withTime: true })}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{contact.message}</Typography>
                </CardContent>
              </Card>

              {replies.map((item, index) => (
                <Card key={item._id || index} sx={{ ml: { sm: 6 }, borderLeft: "3px solid", borderLeftColor: "primary.main" }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">SRI JVR TEXTILES replied</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.createdAt, { withTime: true })}
                      </Typography>
                    </Stack>
                    {/* Admin-authored HTML */}
                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: item.message }} />
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader title="Reply by email" subheader={`To ${contact.email}`} />
                <CardContent sx={{ pt: 1 }}>
                  <RichTextEditor value={reply} onChange={setReply} placeholder="Write your reply…" minHeight={160} />
                  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleSend}
                      disabled={sending}
                      startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    >
                      {sending ? "Sending…" : "Send reply"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader title="Contact details" />
              <CardContent sx={{ pt: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <MailOutlineIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <MuiLink href={`mailto:${contact.email}`} underline="hover" sx={{ wordBreak: "break-all" }}>
                      {contact.email}
                    </MuiLink>
                  </Stack>
                  {contact.phoneNumber && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PhoneOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      <MuiLink href={`tel:${contact.phoneNumber}`} underline="hover">
                        {contact.phoneNumber}
                      </MuiLink>
                      {waLink && (
                        <Button size="small" href={waLink} target="_blank" rel="noreferrer">
                          WhatsApp
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this enquiry?"
        description="The message and its reply history will be removed permanently."
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
