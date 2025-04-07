import  { useEffect}  from "react";
import { useRouter } from 'next/router';
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css';

import pro1 from "@/public/images/product1.png";
import pro2 from "@/public/images/product2.png";
import pro3 from "@/public/images/product3.png";
import pro4 from "@/public/images/product4.png";
import pro5 from "@/public/images/product5.png";
import pro6 from "@/public/images/product6.png";
import pro7 from "@/public/images/product7.png";
import { useGetAllProductsQuery } from "@/utils/api/ProductsApi";
import Preloader from "@/components/Loader/PreLoader";


export default function Products() {
  const router = useRouter();

  const handleUpdateClick = () => {
    router.push(`/ecommerce/Update-Products`);
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
      <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img
          src={product.productVariants?.[0].images[0]}
          alt={product.productName}
          style={{
            width: "80%",
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
          onClick={() => handleUpdateClick(product.name)}
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