import { ArrowForward, BoltOutlined, LocalShippingOutlined, ShieldOutlined, SportsSoccerOutlined } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Brand } from "../../app/models/brand";
import type { Product } from "../../app/models/product";
import type { Type } from "../../app/models/type";
import agent from "../../app/api/agent";
import Spinner from "../../app/layout/Spinner";
import ProductCard from "../catalog/ProductCard";
import { getRecentlyViewedProductIds } from "../../app/util/util";

const featureHighlights = [
    {
        title: "Fast match-day setup",
        description: "Jump straight into curated collections for shoes, rackets, footballs, and bags.",
        icon: <BoltOutlined fontSize="large" />
    },
    {
        title: "Trusted gear picks",
        description: "Browse products from recognizable sports brands without losing track of your basket.",
        icon: <ShieldOutlined fontSize="large" />
    },
    {
        title: "Ready-to-order flow",
        description: "Build a basket, review a demo checkout, and explore the complete storefront journey.",
        icon: <LocalShippingOutlined fontSize="large" />
    }
];

const heroExperiences = [
    {
        key: "football",
        label: "Football",
        eyebrow: "Build your match-day lineup",
        headline: "Football picks that get you from browse to basket faster.",
        description: "Filter straight into football gear, compare featured Adidas and Nike picks, and move through the store with less friction.",
        primaryLink: "/store?type=Football",
        primaryCta: "Shop football",
        secondaryLink: "/store?brand=Adidas&type=Football",
        secondaryCta: "Adidas football edit",
        image: "/images/hero6.jpg",
        stats: [
            { value: "Quick start", label: "Jump into football-only results" },
            { value: "Top brands", label: "Adidas and Nike shortcuts" },
            { value: "Smooth flow", label: "Add to cart in one tap" }
        ]
    },
    {
        key: "rackets",
        label: "Rackets",
        eyebrow: "Dial in your court setup",
        headline: "Find rackets and court gear without digging through the full catalog.",
        description: "Move into racket-focused browsing, compare brands quickly, and keep recently viewed products within easy reach.",
        primaryLink: "/store?type=Rackets",
        primaryCta: "Shop rackets",
        secondaryLink: "/store?brand=Yonex",
        secondaryCta: "See Yonex picks",
        image: "/images/hero4.jpg",
        stats: [
            { value: "Focused browse", label: "Racket-first collection links" },
            { value: "Brand shortcuts", label: "Yonex, Victor, Babolat" },
            { value: "Fewer clicks", label: "Better continuity from home to product" }
        ]
    },
    {
        key: "shoes",
        label: "Shoes",
        eyebrow: "Train in the right fit",
        headline: "Compare shoe styles faster with clearer categories and featured picks.",
        description: "Browse indoor and training shoes, jump into filtered views, and keep the basket and recently viewed flow working together.",
        primaryLink: "/store?type=Shoes",
        primaryCta: "Shop shoes",
        secondaryLink: "/store?brand=ASICS",
        secondaryCta: "Explore ASICS",
        image: "/images/hero2.jpg",
        stats: [
            { value: "Category jump", label: "Shoes collection ready" },
            { value: "Price clarity", label: "USD display across the store" },
            { value: "Persistent context", label: "Recently viewed keeps momentum" }
        ]
    }
];

export default function HomePage(){
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeHero, setActiveHero] = useState(0);

    useEffect(() => {
        let active = true;

        const loadHomeData = async () => {
            try {
                const recentIds = getRecentlyViewedProductIds().slice(0, 3);
                const [featuredResponse, typeResponse, brandResponse, recentProducts] = await Promise.all([
                    agent.Store.list(1, 6, undefined, undefined, "products?page=0&size=6&sort=name&order=asc"),
                    agent.Store.types(),
                    agent.Store.brands(),
                    Promise.all(
                        recentIds.map(id =>
                            agent.Store.details(id).catch(() => null)
                        )
                    )
                ]);

                if (!active) {
                    return;
                }

                setFeaturedProducts(featuredResponse.content.slice(0, 6));
                setTypes(typeResponse.filter((type: Type) => type.id !== 0).slice(0, 4));
                setBrands(brandResponse.filter((brand: Brand) => brand.id !== 0).slice(0, 6));
                setRecentlyViewed(recentProducts.filter((product): product is Product => Boolean(product)));
            } catch (error) {
                console.error("Failed to load homepage data:", error);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadHomeData();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <Spinner message="Loading the storefront..." />;
    }

    const activeExperience = heroExperiences[activeHero];

    return(
        <Stack spacing={5}>
            <Paper
                elevation={0}
                sx={{
                    overflow: "hidden",
                    borderRadius: 6,
                    backgroundImage:
                        `linear-gradient(120deg, rgba(6, 40, 48, 0.95), rgba(15, 92, 77, 0.9)), url(${activeExperience.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    color: "common.white",
                    p: { xs: 3, md: 6 }
                }}
            >
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Stack spacing={2.5}>
                            <Typography variant="overline" sx={{ letterSpacing: 2.4, color: "rgba(255,255,255,0.72)" }}>
                                {activeExperience.eyebrow}
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800, maxWidth: 680 }}>
                                {activeExperience.headline}
                            </Typography>
                            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 620 }}>
                                {activeExperience.description}
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button
                                    component={Link}
                                    to={activeExperience.primaryLink}
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                >
                                    {activeExperience.primaryCta}
                                </Button>
                                <Button
                                    component={Link}
                                    to={activeExperience.secondaryLink}
                                    variant="outlined"
                                    size="large"
                                    sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.5)" }}
                                >
                                    {activeExperience.secondaryCta}
                                </Button>
                            </Stack>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                {activeExperience.stats.map((stat) => (
                                    <Paper
                                        key={stat.label}
                                        sx={{
                                            p: 2,
                                            minWidth: 170,
                                            borderRadius: 4,
                                            bgcolor: "rgba(255,255,255,0.08)",
                                            color: "common.white"
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.74)" }}>
                                            {stat.label}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Stack spacing={2}>
                            <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: "rgba(255,255,255,0.08)", color: "common.white" }}>
                                <Typography variant="overline" sx={{ letterSpacing: 1.4 }}>
                                    Choose your game
                                </Typography>
                                <Stack spacing={1.5} mt={1.5}>
                                    {heroExperiences.map((experience, index) => (
                                        <Paper
                                            key={experience.key}
                                            onClick={() => setActiveHero(index)}
                                            sx={{
                                                p: 2,
                                                borderRadius: 4,
                                                cursor: "pointer",
                                                bgcolor: index === activeHero ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.06)",
                                                color: index === activeHero ? "text.primary" : "common.white",
                                                border: index === activeHero ? "2px solid rgba(249,115,22,0.9)" : "1px solid rgba(255,255,255,0.1)",
                                                transition: "transform 160ms ease, background-color 160ms ease, border-color 160ms ease",
                                                "&:hover": {
                                                    transform: "translateY(-2px)",
                                                    borderColor: "rgba(249,115,22,0.9)"
                                                }
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                        {experience.label}
                                                    </Typography>
                                                    <Typography variant="body2" color={index === activeHero ? "text.secondary" : "rgba(255,255,255,0.72)"}>
                                                        {experience.eyebrow}
                                                    </Typography>
                                                </Box>
                                                <SportsSoccerOutlined color={index === activeHero ? "secondary" : "inherit"} />
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Paper>
                            <Grid container spacing={2}>
                                {featureHighlights.map((feature) => (
                                    <Grid item xs={12} sm={4} md={12} key={feature.title}>
                                        <Card sx={{ height: "100%", borderRadius: 4 }}>
                                            <CardContent>
                                                <Box color="secondary.main" mb={1}>
                                                    {feature.icon}
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                    {feature.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {feature.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: 5 }}>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} mb={3}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                    Shop by category
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Start with a collection and land straight on a filtered store view.
                                </Typography>
                            </Box>
                        </Stack>
                        <Grid container spacing={2}>
                            {types.map((type, index) => (
                                <Grid item xs={12} sm={6} key={type.id}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.94), rgba(244,247,246,0.98)), url(/images/hero${(index % 3) + 1}.jpg)`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            minHeight: 180
                                        }}
                                    >
                                        <Stack spacing={1.5} justifyContent="space-between" sx={{ height: "100%" }}>
                                            <Box>
                                                <Typography variant="overline" color="secondary.main">
                                                    Collection
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                    {type.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
                                                    Discover popular picks and jump into a filtered product view instantly.
                                                </Typography>
                                            </Box>
                                            <Button
                                                component={Link}
                                                to={`/store?type=${encodeURIComponent(type.name)}`}
                                                variant="text"
                                                color="secondary"
                                                sx={{ alignSelf: "flex-start", px: 0 }}
                                                endIcon={<ArrowForward />}
                                            >
                                                Browse {type.name.toLowerCase()}
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 5, height: "100%" }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                            Top brands
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Jump into popular brand filters with one click.
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {brands.map((brand) => (
                                <Chip
                                    key={brand.id}
                                    component={Link}
                                    to={`/store?brand=${encodeURIComponent(brand.name)}`}
                                    clickable
                                    label={brand.name}
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ px: 1.5, py: 2.5, borderRadius: 3 }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, borderRadius: 5 }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} mb={3}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Featured products
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Fresh picks from the catalog with direct add-to-cart actions.
                        </Typography>
                    </Box>
                    <Button component={Link} to="/store" variant="outlined" color="secondary">
                        View full catalog
                    </Button>
                </Stack>
                <Grid container spacing={3}>
                    {featuredProducts.map((product) => (
                        <Grid item xs={12} sm={6} lg={4} key={product.id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {recentlyViewed.length > 0 && (
                <Paper sx={{ p: 3, borderRadius: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        Recently viewed
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Pick up where you left off without digging back through the catalog.
                    </Typography>
                    <Grid container spacing={3}>
                        {recentlyViewed.map((product) => (
                            <Grid item xs={12} md={4} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}
        </Stack>
    )
}
