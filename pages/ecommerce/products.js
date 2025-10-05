import  { useEffect}  from "react";
import { useRouter } from 'next/router';
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css';
import { useGetAllProductsQuery } from "@/utils/api/ProductsApi";
import Preloader from "@/components/Loader/PreLoader";


export default function Products() {
  const router = useRouter();

  const handleUpdateClick = (id) => {
    router.push(`/ecommerce/updateProduct/${id}`);
  };

    const handleDetailedViewClick = (id) => {
    router.push(`/ecommerce/productDetails/${id}`);
  };
  const { data : products, isLoading } = useGetAllProductsQuery();

  if(isLoading) return <Preloader />

  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Products</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Products</li>
        </ul>
      </div>

      <Grid container spacing={3}>
      {products?.products.map((product, index) => (
  <Grid item xs={12} sm={6} md={4} key={index}>
    <Card
      sx={{
        boxShadow: "none",
        borderRadius: "10px",
        p: "25px",
        textAlign: "center",
        height: "100%", // Ensures all cards have the same height
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image Container */}
      <div onClick={() => handleDetailedViewClick(product._id)} style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img
          src={product.productVariants?.[0]?.images[0]}
          alt={product.productName}
          style={{
            width: "80%",
            cursor : "pointer",
            height: "100%",
            borderRadius: "10px",
            objectFit: "cover", // Ensures images fill the container properly
          }}
        />
      </div>

      {/* Content Container */}
      <div style={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1.5rem",
            fontWeight: "600",
            mb: "10px",
          }}
        >
          {product.productName}
        </Typography>

        <Typography variant="body1" sx={{ mb: "10px", fontSize: "1rem" }}>
          Category: {product.productCategory}
        </Typography>
        <Typography variant="body1" sx={{ mb: "10px", fontSize: "1rem" }}>
          Type: {product.productType}
        </Typography>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "auto" }}>
        <Button
          variant="contained"
          sx={{
            textTransform: "capitalize",
            borderRadius: "8px",
            fontWeight: "500",
            fontSize: "13px",
            padding: "12px 20px",
            color: "#fff !important",
          }}
          onClick={() => handleUpdateClick(product._id)}
          
        >
          Update
        </Button>
        <Button
          variant="outlined"
          sx={{
            textTransform: "capitalize",
            borderRadius: "8px",
            fontWeight: "500",
            fontSize: "13px",
            padding: "12px 20px",
          }}
        >
          Delete
        </Button>
      </div>
    </Card>
  </Grid>
))}

      </Grid>
    </>
  );
}