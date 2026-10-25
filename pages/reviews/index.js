import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Rating,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SearchField from "@/components/common/SearchField";
import ProductThumb from "@/components/common/ProductThumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/common/States";
import { MobileList, MobileRow, desktopOnly } from "@/components/common/MobileList";
import { errorMessage } from "@/utils/api/baseApi";
import {
  useBlockReviewerMutation,
  useDeleteReviewMutation,
  useGetReviewBlocksQuery,
  useGetReviewsQuery,
  useUnblockReviewerMutation,
} from "@/utils/api/ReviewsApi";
import { formatDate, formatNumber, formatRelative } from "@/utils/format";

const RATING_FILTERS = [0, 5, 4, 3, 2, 1];

function BlockDialog({ review, onClose }) {
  const [reason, setReason] = useState("");
  const [deleteReviews, setDeleteReviews] = useState(false);
  const [blockReviewer, { isLoading }] = useBlockReviewerMutation();

  const submit = async () => {
    try {
      const res = await blockReviewer({ userId: review.userId, reason, deleteReviews }).unwrap();
      toast.success(res.message);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Could not block this customer"));
    }
  };

  return (
    <Dialog open onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Block {review.user} from reviewing?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          They won&apos;t be able to post or edit reviews on any product. You can unblock them at any time.
          {review.userEmail && (
            <>
              <br />
              Account: <b>{review.userEmail}</b>
            </>
          )}
        </Typography>
        <TextField
          label="Reason (only visible to admins)"
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          fullWidth
          multiline
          minRows={2}
          size="small"
        />
        <FormControlLabel
          sx={{ mt: 1.5 }}
          control={<Checkbox checked={deleteReviews} onChange={(e) => setDeleteReviews(e.target.checked)} />}
          label="Also delete all of their existing reviews"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={isLoading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="error"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
        >
          Block
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReviewsTab() {
  const [q, setQ] = useState("");
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [toDelete, setToDelete] = useState(null);
  const [toBlock, setToBlock] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetReviewsQuery({
    page: page + 1,
    limit: rowsPerPage,
    rating: rating || "",
    q,
  });
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [unblockReviewer] = useUnblockReviewerMutation();

  const reviews = data?.reviews || [];

  const confirmDelete = async () => {
    try {
      await deleteReview(toDelete._id).unwrap();
      toast.success("Review deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the review"));
    }
  };

  const unblock = async (review) => {
    try {
      await unblockReviewer(review.userId).unwrap();
      toast.success(`${review.user} can write reviews again`);
    } catch (err) {
      toast.error(errorMessage(err, "Could not unblock this customer"));
    }
  };

  const renderActions = (review) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {review.userId ? (
        review.isBlocked ? (
          <Tooltip title="Allow this customer to review again">
            <IconButton size="small" color="success" onClick={() => unblock(review)} aria-label="Unblock customer">
              <LockOpenOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Block this customer from reviewing">
            <IconButton size="small" onClick={() => setToBlock(review)} aria-label="Block customer">
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      ) : (
        <Tooltip title="Older review without a linked account — it can be deleted but not blocked">
          <span>
            <IconButton size="small" disabled aria-label="Block customer">
              <BlockIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title="Delete review">
        <IconButton size="small" color="error" onClick={() => setToDelete(review)} aria-label="Delete review">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
        sx={{ p: 2 }}
      >
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {RATING_FILTERS.map((value) => (
            <Chip
              key={value}
              label={value ? `${value} ★` : "All ratings"}
              color={rating === value ? "primary" : "default"}
              variant={rating === value ? "filled" : "outlined"}
              onClick={() => {
                setRating(value);
                setPage(0);
              }}
            />
          ))}
        </Stack>
        <SearchField
          value={q}
          onChange={(value) => {
            setQ(value);
            setPage(0);
          }}
          placeholder="Customer, email or review text"
        />
      </Stack>

      {error ? (
        <ErrorState error={error} onRetry={refetch} title="Couldn't load reviews" />
      ) : (
        <>
          <MobileList loading={isLoading}>
            {reviews.map((review) => (
              <MobileRow key={review._id}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <ProductThumb src={review.product?.image} alt={review.product?.productName} size={40} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {review.product?.productName || "Deleted product"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                      {review.user} · {formatRelative(review.createdAt)}
                    </Typography>
                  </Box>
                  {renderActions(review)}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Rating value={review.rating} readOnly size="small" />
                  {review.isBlocked && <Chip size="small" color="error" variant="outlined" label="Blocked" />}
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                  {review.comment}
                </Typography>
                {review.imageUrls?.length > 0 && (
                  <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                    {review.imageUrls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        <Avatar variant="rounded" src={url} sx={{ width: 48, height: 48 }} />
                      </a>
                    ))}
                  </Stack>
                )}
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 1 }}>
                  {review.userEmail || (review.userId ? "No email" : "Older review · no account linked")}
                </Typography>
              </MobileRow>
            ))}
          </MobileList>

          <TableContainer
            sx={{ ...desktopOnly, opacity: isFetching && !isLoading ? 0.6 : 1, transition: "opacity 150ms ease" }}
          >
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell sx={{ width: "38%" }}>Review</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 5 }).map((__, cell) => (
                          <TableCell key={cell}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : reviews.map((review) => (
                      <TableRow key={review._id} hover sx={{ verticalAlign: "top" }}>
                        <TableCell>
                          {review.product ? (
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                              component={Link}
                              href={`/products/${review.product._id}`}
                              sx={{ color: "inherit", textDecoration: "none", "&:hover .name": { color: "primary.main" } }}
                            >
                              <ProductThumb src={review.product.image} alt={review.product.productName} size={40} />
                              <Typography className="name" variant="body2" fontWeight={600} sx={{ maxWidth: 180 }} noWrap>
                                {review.product.productName}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Deleted product
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                            {review.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 200 }}>
                            {review.userEmail || (review.userId ? "No email" : "Older review · no account linked")}
                          </Typography>
                          {review.isBlocked && (
                            <Chip size="small" color="error" variant="outlined" label="Blocked" icon={<BlockIcon />} sx={{ mt: 0.75 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                            {review.comment}
                          </Typography>
                          {review.imageUrls?.length > 0 && (
                            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                              {review.imageUrls.map((url) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer">
                                  <Avatar variant="rounded" src={url} sx={{ width: 44, height: 44 }} />
                                </a>
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formatDate(review.createdAt, { withTime: true })}>
                            <Typography variant="body2" component="span">
                              {formatRelative(review.createdAt)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">{renderActions(review)}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!isLoading && reviews.length === 0 && (
            <EmptyState
              icon={RateReviewOutlinedIcon}
              title={rating || q ? "No matching reviews" : "No reviews yet"}
              description={rating || q ? "Try another rating or search." : "Reviews customers post on the storefront will appear here."}
            />
          )}

          <TablePagination
            component="div"
            count={data?.total || 0}
            page={page}
            onPageChange={(event, value) => setPage(value)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this review?"
        description={toDelete ? `${toDelete.user}'s review and its photos will be removed from the storefront. This can't be undone.` : ""}
        confirmLabel="Delete"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
      {toBlock && <BlockDialog review={toBlock} onClose={() => setToBlock(null)} />}
    </>
  );
}

function BlockedTab() {
  const { data, isLoading, error, refetch } = useGetReviewBlocksQuery();
  const [unblockReviewer, { isLoading: isUnblocking }] = useUnblockReviewerMutation();
  const [toUnblock, setToUnblock] = useState(null);
  const blocks = data?.blocks || [];

  const confirmUnblock = async () => {
    try {
      await unblockReviewer(toUnblock.userId).unwrap();
      toast.success(`${toUnblock.name || "Customer"} can write reviews again`);
      setToUnblock(null);
    } catch (err) {
      toast.error(errorMessage(err, "Could not unblock this customer"));
    }
  };

  if (error) return <ErrorState error={error} onRetry={refetch} title="Couldn't load blocked customers" />;

  return (
    <>
      <MobileList loading={isLoading} rows={3}>
        {blocks.map((block) => (
          <MobileRow key={block.userId}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {block.name || "Customer"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                  {block.email || "No email"} · blocked {formatRelative(block.createdAt)}
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => setToUnblock(block)}>
                Unblock
              </Button>
            </Stack>
            {block.reason && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {block.reason}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              {formatNumber(block.reviewCount)} review{block.reviewCount === 1 ? "" : "s"} still published
            </Typography>
          </MobileRow>
        ))}
      </MobileList>

      <TableContainer sx={desktopOnly}>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="center">Reviews left</TableCell>
              <TableCell>Blocked</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((__, cell) => (
                      <TableCell key={cell}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : blocks.map((block) => (
                  <TableRow key={block.userId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {block.name || "Customer"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {block.email || "No email"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={block.reason ? "text.primary" : "text.secondary"}>
                        {block.reason || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" variant="outlined" label={formatNumber(block.reviewCount)} />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={formatDate(block.createdAt, { withTime: true })}>
                        <Typography variant="body2" component="span">
                          {formatRelative(block.createdAt)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" startIcon={<HowToRegOutlinedIcon />} onClick={() => setToUnblock(block)}>
                        Unblock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!isLoading && blocks.length === 0 && (
        <EmptyState
          icon={HowToRegOutlinedIcon}
          title="No blocked customers"
          description="Customers you block from the reviews list will appear here."
        />
      )}

      <ConfirmDialog
        open={Boolean(toUnblock)}
        title="Unblock this customer?"
        description={toUnblock ? `${toUnblock.name || "This customer"} will be able to write reviews again.` : ""}
        confirmLabel="Unblock"
        loading={isUnblocking}
        onConfirm={confirmUnblock}
        onClose={() => setToUnblock(null)}
      />
    </>
  );
}

export default function Reviews() {
  const router = useRouter();
  const tab = router.query.tab === "blocked" ? "blocked" : "all";
  const { data } = useGetReviewBlocksQuery();
  const blockedCount = data?.blocks?.length || 0;

  const setTab = (value) => {
    const query = { ...router.query };
    if (value === "blocked") query.tab = "blocked";
    else delete query.tab;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="Moderate product reviews and control who can post them." />

      <Card>
        <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Tab value="all" label="All reviews" />
          <Tab
            value="blocked"
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                Blocked customers
                {blockedCount > 0 && <Chip size="small" label={blockedCount} color="error" sx={{ height: 20 }} />}
              </Box>
            }
          />
        </Tabs>
        {tab === "blocked" ? <BlockedTab /> : <ReviewsTab />}
      </Card>
    </>
  );
}
