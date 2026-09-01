import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AgentBridge E-Commerce Database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@agentbridge.io',
      name: 'Alex Rivera',
      passwordHash,
      role: 'CUSTOMER',
      addresses: {
        create: [
          {
            fullName: 'Alex Rivera',
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            zipCode: '97477',
            country: 'United States',
            phone: '+1 (555) 234-5678',
            isDefault: true,
          },
          {
            fullName: 'Alex Rivera (Office)',
            street: '100 Silicon Way, Suite 400',
            city: 'San Jose',
            state: 'CA',
            zipCode: '95134',
            country: 'United States',
            phone: '+1 (555) 987-6543',
            isDefault: false,
          },
        ],
      },
      cart: {
        create: {},
      },
      wishlist: {
        create: {},
      },
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      email: 'sarah.j@example.com',
      name: 'Sarah Jenkins',
      passwordHash,
      role: 'CUSTOMER',
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  // Create Categories
  const categoriesData = [
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'High-performance laptops for gaming, productivity, and creative workflows.',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    },
    {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Flagship and budget-friendly smartphones with advanced camera systems and fast processors.',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    },
    {
      name: 'Computer Accessories',
      slug: 'computer-accessories',
      description: 'Ergonomic keyboards, precision mice, hubs, docks, and essential desktop peripherals.',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      description: 'Console hardware, gaming controllers, mechanical gear, and immersive gaming accessories.',
      image: 'https://images.unsplash.com/photo-1612287233256-42798e4d29a5?w=800&q=80',
    },
    {
      name: 'Headphones',
      slug: 'headphones',
      description: 'Noise-cancelling wireless headphones, studio reference monitors, and spatial earbuds.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Monitors',
      slug: 'monitors',
      description: 'Ultra-wide 4K, OLED, high refresh rate gaming displays, and color-accurate pro monitors.',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    },
    {
      name: 'Cameras',
      slug: 'cameras',
      description: 'Mirrorless cameras, 4K vlog webcams, lenses, and creator streaming kits.',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    },
    {
      name: 'Smart Devices',
      slug: 'smart-devices',
      description: 'Smart watches, home automation hubs, security sensors, and ambient lighting.',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    },
    {
      name: 'Audio',
      slug: 'audio',
      description: 'High-fidelity smart speakers, soundbars, DACs, and home theater audio gear.',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  // Create 26 Rich Products
  const productsData = [
    // Laptops
    {
      name: 'ApexPro 16 Gaming Laptop - RTX 4080',
      slug: 'apexpro-16-gaming-laptop-rtx-4080',
      description: 'Dominate modern AAA titles with the ApexPro 16. Powered by an Intel Core i9-14900HX processor and NVIDIA GeForce RTX 4080 GPU, paired with a blisteringly fast 240Hz QHD+ 16:10 mini-LED display with 100% DCI-P3 coverage.',
      categoryId: categoryMap['laptops'],
      brand: 'ApexTech',
      price: 2399.99,
      discountPercent: 10,
      rating: 4.8,
      reviewCount: 42,
      stock: 14,
      isFeatured: true,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Processor: 'Intel Core i9-14900HX (24 Cores, up to 5.8 GHz)',
        Graphics: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (175W TGP)',
        Memory: '32GB DDR5 5600MHz (Upgradeable to 64GB)',
        Storage: '2TB NVMe PCIe Gen4 SSD',
        Display: '16-inch QHD+ (2560x1600) 240Hz Mini-LED 1100 nits',
        Weight: '2.4 kg (5.29 lbs)',
        OS: 'Windows 11 Pro',
      }),
      tags: JSON.stringify(['laptop', 'gaming', 'rtx 4080', 'intel i9', 'high-end', 'apexpro']),
    },
    {
      name: 'UltraBlade 14 Stealth Laptop',
      slug: 'ultrablade-14-stealth-laptop',
      description: 'Engineered for portable productivity and light creative workflows. Features AMD Ryzen 9 8945HS with Radeon 780M graphics and dedicated Ryzen AI NPU in a CNC aluminum unibody chassis measuring just 14.9mm thin.',
      categoryId: categoryMap['laptops'],
      brand: 'ApexTech',
      price: 1499.0,
      discountPercent: 15,
      rating: 4.7,
      reviewCount: 38,
      stock: 22,
      isFeatured: true,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Processor: 'AMD Ryzen 9 8945HS (8 Cores, 16 Threads)',
        Graphics: 'AMD Radeon 780M Integrated Graphics + 16 TOPS NPU',
        Memory: '32GB LPDDR5X 7500MHz',
        Storage: '1TB NVMe PCIe 4.0 SSD',
        Display: '14-inch 2.8K (2880x1800) OLED 120Hz 500 nits',
        Battery: '75Wh (Up to 15 hours)',
        Weight: '1.28 kg (2.82 lbs)',
      }),
      tags: JSON.stringify(['laptop', 'ultrabook', 'oled', 'ryzen 9', 'lightweight', 'thin']),
    },
    {
      name: 'Vanguard G15 Budget Gaming Laptop - RTX 3050',
      slug: 'vanguard-g15-budget-gaming-laptop-rtx-3050',
      description: 'The sweet spot for budget gaming and esports. Equipped with an Intel Core i5-13500H, NVIDIA RTX 3050 6GB GDDR6, and a responsive 144Hz IPS display, making competitive gaming accessible under $800.',
      categoryId: categoryMap['laptops'],
      brand: 'Vanguard',
      price: 799.99,
      discountPercent: 12,
      rating: 4.5,
      reviewCount: 89,
      stock: 35,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Processor: 'Intel Core i5-13500H (12 Cores)',
        Graphics: 'NVIDIA GeForce RTX 3050 6GB',
        Memory: '16GB DDR5 4800MHz',
        Storage: '512GB PCIe NVMe SSD',
        Display: '15.6-inch FHD (1920x1080) 144Hz IPS',
        Weight: '2.1 kg',
      }),
      tags: JSON.stringify(['laptop', 'gaming', 'rtx 3050', 'budget', 'under 1000', 'vanguard']),
    },

    // Smartphones
    {
      name: 'Nexus Horizon Pro 5G - 256GB',
      slug: 'nexus-horizon-pro-5g-256gb',
      description: 'The vanguard of mobile computational photography. Features a 1-inch 50MP main sensor with variable aperture, periscope 5x telephoto, Snapdragon 8 Gen 3 chipset, and a dynamic 1-120Hz LTPO AMOLED display.',
      categoryId: categoryMap['smartphones'],
      brand: 'Nexus',
      price: 1099.0,
      discountPercent: 5,
      rating: 4.9,
      reviewCount: 65,
      stock: 18,
      isFeatured: true,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Display: '6.73-inch 2K LTPO AMOLED 120Hz (3000 nits peak)',
        Chipset: 'Qualcomm Snapdragon 8 Gen 3',
        RAM: '12GB LPDDR5X',
        Storage: '256GB UFS 4.0',
        Cameras: '50MP 1-inch Main + 50MP Ultra-Wide + 50MP 5x Periscope',
        Battery: '5000mAh with 90W HyperCharge & 50W Wireless',
        WaterResistance: 'IP68 Certified',
      }),
      tags: JSON.stringify(['smartphone', '5g', 'flagship', 'camera', 'snapdragon', 'nexus']),
    },
    {
      name: 'Aether Nova 12 Lite 5G',
      slug: 'aether-nova-12-lite-5g',
      description: 'Featherlight stylish smartphone with a vibrant 120Hz curved AMOLED screen, 108MP clarity camera, 67W fast charging, and all-day 5000mAh battery life.',
      categoryId: categoryMap['smartphones'],
      brand: 'Aether',
      price: 349.99,
      discountPercent: 10,
      rating: 4.4,
      reviewCount: 51,
      stock: 40,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Display: '6.67-inch FHD+ AMOLED 120Hz',
        Chipset: 'MediaTek Dimensity 7050',
        RAM: '8GB + 8GB Extended RAM',
        Storage: '128GB Expandable via MicroSD',
        MainCamera: '108MP f/1.75 with EIS',
        Charging: '67W FlashCharge (0-100% in 42 mins)',
      }),
      tags: JSON.stringify(['smartphone', 'budget', '5g', 'amoled', 'lightweight', 'aether']),
    },

    // Computer Accessories
    {
      name: 'Keycraft Quantum 75 Wireless Mechanical Keyboard',
      slug: 'keycraft-quantum-75-wireless-mechanical-keyboard',
      description: 'Hot-swappable gasket-mounted 75% mechanical keyboard with factory-lubed linear switches, sound-dampening silicone foam, south-facing RGB, and CNC anodized aluminum frame.',
      categoryId: categoryMap['computer-accessories'],
      brand: 'Keycraft',
      price: 189.99,
      discountPercent: 0,
      rating: 4.9,
      reviewCount: 112,
      stock: 28,
      isFeatured: true,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Layout: '75% Compact (81 Keys)',
        Mounting: 'Gasket Mount Structure with FR4 Plate',
        Switches: 'Keycraft Matcha Linear (Pre-lubed, 45g actuation)',
        Connectivity: 'Tri-Mode: 2.4GHz Wireless, Bluetooth 5.2, USB-C',
        Battery: '4000mAh (Up to 200 hours without RGB)',
        Keycaps: 'Double-shot PBT Cherry Profile',
      }),
      tags: JSON.stringify(['keyboard', 'mechanical', 'wireless', 'custom keyboard', 'hot-swap', 'keycraft']),
    },
    {
      name: 'AeroGlider Pro Ultra-Lightweight Wireless Gaming Mouse',
      slug: 'aeroglider-pro-ultralight-wireless-gaming-mouse',
      description: 'Weighing only 49 grams without honeycomb holes, equipped with the FocusGen 30K Optical Sensor, 4000Hz polling rate support, and optical micro-switches rated for 90 million clicks.',
      categoryId: categoryMap['computer-accessories'],
      brand: 'Vanguard',
      price: 99.99,
      discountPercent: 15,
      rating: 4.8,
      reviewCount: 94,
      stock: 55,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Weight: '49 grams',
        Sensor: 'FocusGen 30,000 DPI Optical Sensor',
        PollingRate: 'Up to 4000Hz Wireless with Hyperspeed Dongle',
        Switches: 'Gen-3 Optical Mouse Switches (90M Clicks)',
        BatteryLife: 'Up to 80 hours continuous play at 1000Hz',
      }),
      tags: JSON.stringify(['mouse', 'gaming mouse', 'lightweight', 'wireless', 'esports', 'vanguard']),
    },
    {
      name: 'OmniDock 14-in-1 Thunderbolt 4 Pro Dock',
      slug: 'omnidock-14-in-1-thunderbolt-4-pro-dock',
      description: 'Universal 40Gbps Thunderbolt 4 docking station with dual 4K 60Hz display support, 96W Power Delivery host charging, UHS-II SD card reader, 2.5GbE Ethernet, and audio combo jack.',
      categoryId: categoryMap['computer-accessories'],
      brand: 'ApexTech',
      price: 249.99,
      discountPercent: 20,
      rating: 4.7,
      reviewCount: 33,
      stock: 19,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Interface: 'Thunderbolt 4 / USB4 (40Gbps)',
        HostPowerDelivery: 'Up to 96W Fast Charging',
        Ports: '3x Thunderbolt 4, 1x DisplayPort 1.4, 1x HDMI 2.1, 4x USB-A 3.2, 1x 2.5Gbps LAN, SD 4.0, MicroSD, 3.5mm Audio',
        DisplaySupport: 'Single 8K @ 60Hz or Dual 4K @ 60Hz',
      }),
      tags: JSON.stringify(['dock', 'thunderbolt 4', 'usb-c hub', 'accessories', 'laptop dock']),
    },

    // Gaming
    {
      name: 'TitanStrike Wireless Pro Controller with Hall Effect Sticks',
      slug: 'titanstrike-wireless-pro-controller',
      description: 'Zero stick drift guaranteed with electromagnetic Hall Effect joysticks and triggers. Features 4 remappable back paddles, mechanical micro-switch face buttons, and interchangeable thumbstick caps.',
      categoryId: categoryMap['gaming'],
      brand: 'Vanguard',
      price: 119.99,
      discountPercent: 10,
      rating: 4.8,
      reviewCount: 77,
      stock: 31,
      isFeatured: true,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80',
        'https://images.unsplash.com/photo-1592840496073-b50a5cb05427?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Sticks: 'Hall Effect Electromagnetic (Anti-Drift)',
        Triggers: 'Dual-mode Hall Effect with Trigger Stops',
        Paddles: '4 Ergonomic Back Paddles',
        Compatibility: 'PC, Switch, iOS, Android, Steam Deck',
        Battery: '1200mAh (20+ hours play time)',
      }),
      tags: JSON.stringify(['gaming', 'controller', 'hall effect', 'pc gaming', 'wireless', 'gamepad']),
    },
    {
      name: 'Vortex VR Elite Spatial Headset',
      slug: 'vortex-vr-elite-spatial-headset',
      description: 'Next-gen standalone and PC-tethered mixed reality headset with 4K pancake optics, eye tracking with dynamic foveated rendering, color passthrough, and spatial audio.',
      categoryId: categoryMap['gaming'],
      brand: 'VortexVR',
      price: 699.99,
      discountPercent: 5,
      rating: 4.6,
      reviewCount: 29,
      stock: 12,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Resolution: '2160 x 2160 per eye Pancake Lenses',
        FieldOfView: '110 degrees',
        Tracking: '6DoF Inside-Out + Eye & Hand Tracking',
        Processor: 'Snapdragon XR2 Gen 2',
        Weight: '440g with counterbalanced ergonomic strap',
      }),
      tags: JSON.stringify(['vr', 'gaming', 'mixed reality', 'spatial computing', 'headset']),
    },

    // Headphones
    {
      name: 'SoundAura ANC 900 Noise-Cancelling Headphones',
      slug: 'soundaura-anc-900-noise-cancelling-headphones',
      description: 'Industry-leading active noise cancellation with adaptive 8-mic array, custom 40mm beryllium drivers, LDAC high-resolution audio support, and 45-hour battery life with plush memory foam earcups.',
      categoryId: categoryMap['headphones'],
      brand: 'SoundAura',
      price: 349.99,
      discountPercent: 15,
      rating: 4.9,
      reviewCount: 140,
      stock: 25,
      isFeatured: true,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Driver: '40mm Custom Beryllium Diaphragm',
        FrequencyResponse: '5Hz - 45,000Hz (Hi-Res Certified)',
        Codecs: 'LDAC, AAC, aptX Adaptive, SBC',
        NoiseCancellation: 'Hybrid Active Noise Cancellation (-42dB attenuation)',
        BatteryLife: '45 hours (ANC On), Quick charge (15 mins = 6 hours)',
      }),
      tags: JSON.stringify(['headphones', 'anc', 'wireless', 'noise cancelling', 'hi-res', 'soundaura']),
    },
    {
      name: 'SonicBuds Pro 3 True Wireless Earbuds',
      slug: 'sonicbuds-pro-3-true-wireless-earbuds',
      description: 'Compact wireless earbuds with dual driver acoustic architecture, spatial audio head tracking, IPX7 sweatproof rating, and wireless charging case.',
      categoryId: categoryMap['headphones'],
      brand: 'SoundAura',
      price: 149.99,
      discountPercent: 20,
      rating: 4.6,
      reviewCount: 88,
      stock: 60,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Drivers: '10mm Dynamic Bass Woofer + 6mm Planar Tweeter',
        ANC: 'Smart Adaptive ANC up to -35dB',
        Battery: '8.5h earbuds + 30h with charging case',
        WaterResistance: 'IPX7 (Sweat and rain proof)',
      }),
      tags: JSON.stringify(['earbuds', 'wireless', 'anc', 'waterproof', 'bluetooth', 'soundaura']),
    },

    // Monitors
    {
      name: 'SpectraView 34-inch QD-OLED Curved Gaming Monitor',
      slug: 'spectraview-34-qd-oled-curved-gaming-monitor',
      description: 'Infinite contrast ratio and 0.03ms response time on a 3440x1440 UWQHD 175Hz Quantum Dot OLED panel with 1800R curvature and true 10-bit color accuracy.',
      categoryId: categoryMap['monitors'],
      brand: 'SpectraView',
      price: 899.99,
      discountPercent: 10,
      rating: 4.9,
      reviewCount: 53,
      stock: 10,
      isFeatured: true,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
        'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Panel: '34-inch QD-OLED (Samsung Display Panel)',
        Resolution: 'UWQHD (3440 x 1440) 21:9 Aspect Ratio',
        RefreshRate: '175Hz native',
        ResponseTime: '0.03ms (GtG)',
        ColorGamut: '99.3% DCI-P3, Delta E < 2 Factory Calibrated',
        Ports: '2x HDMI 2.1, 1x DP 1.4, USB-C 65W PD, USB Hub',
      }),
      tags: JSON.stringify(['monitor', 'oled', 'curved', 'ultrawide', '175hz', 'gaming monitor', 'spectraview']),
    },
    {
      name: 'ClarityPro 27-inch 4K Colorist Monitor',
      slug: 'claritypro-27-inch-4k-colorist-monitor',
      description: 'Professional 27-inch UHD 4K IPS display engineered for video editors, graphic designers, and photographers. Features hardware calibration, 99% Adobe RGB, and 90W USB-C single cable connectivity.',
      categoryId: categoryMap['monitors'],
      brand: 'SpectraView',
      price: 549.99,
      discountPercent: 0,
      rating: 4.7,
      reviewCount: 31,
      stock: 16,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Resolution: '3840 x 2160 (4K UHD) @ 60Hz',
        Panel: 'IPS with Uniformity Compensation',
        ColorAccuracy: '99% AdobeRGB, 100% sRGB, Delta E < 1.5',
        Brightness: '400 nits (VESA DisplayHDR 400)',
        Stand: 'Fully ergonomic: Height, Tilt, Swivel, 90° Pivot',
      }),
      tags: JSON.stringify(['monitor', '4k', 'professional', 'color accurate', 'usb-c', 'spectraview']),
    },

    // Cameras
    {
      name: 'LumixPro X8 Mirrorless Cinema & Photo Camera',
      slug: 'lumixpro-x8-mirrorless-camera',
      description: 'Full-frame 33MP BSI CMOS sensor capable of uncropped 4K 60p 10-bit 4:2:2 internal recording, AI-driven subject recognition autofocus, and 8-stop in-body image stabilization.',
      categoryId: categoryMap['cameras'],
      brand: 'LumixPro',
      price: 1899.0,
      discountPercent: 8,
      rating: 4.8,
      reviewCount: 26,
      stock: 8,
      isFeatured: true,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Sensor: '33MP Full-Frame Exmor R CMOS',
        Video: '4K 60p 10-bit 4:2:2 All-Intra, FHD 120p',
        Autofocus: '759 phase-detection points with AI Subject Detection',
        Stabilization: '5-axis 8.0-stop In-Body Image Stabilization (IBIS)',
        MediaSlots: 'Dual SD UHS-II / CFexpress Type A',
      }),
      tags: JSON.stringify(['camera', 'mirrorless', '4k video', 'photography', 'full frame', 'lumixpro']),
    },
    {
      name: 'StreamCast 4K HDR Creator Webcam',
      slug: 'streamcast-4k-hdr-creator-webcam',
      description: 'Sony STARVIS 2 sensor webcam capturing pristine 4K 30fps / 1080p 60fps with advanced HDR tone mapping, AI auto-framing, dual stereo noise-cancelling mics, and physical privacy shutter.',
      categoryId: categoryMap['cameras'],
      brand: 'LumixPro',
      price: 139.99,
      discountPercent: 15,
      rating: 4.5,
      reviewCount: 71,
      stock: 45,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Resolution: '4K @ 30FPS / 1080P @ 60FPS HDR',
        Sensor: 'Sony STARVIS 2 1/1.8" CMOS',
        FieldOfView: 'Adjustable 65° / 78° / 90° FOV',
        Microphones: 'Dual omnidirectional beamforming microphones',
        Mount: 'Universal monitor clip with 1/4" tripod thread',
      }),
      tags: JSON.stringify(['webcam', '4k', 'streaming', 'creator', 'camera', 'usb-c']),
    },

    // Smart Devices
    {
      name: 'AuraWatch Chrono Smartwatch with ECG & Titanium Case',
      slug: 'aurawatch-chrono-smartwatch-titanium',
      description: 'Aerospace-grade titanium chassis, sapphire crystal glass, medical-grade ECG and blood oxygen monitoring, dual-frequency GPS, and 14-day battery life.',
      categoryId: categoryMap['smart-devices'],
      brand: 'Aura',
      price: 299.99,
      discountPercent: 10,
      rating: 4.7,
      reviewCount: 64,
      stock: 20,
      isFeatured: true,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Case: '46mm Grade 5 Titanium + Sapphire Glass',
        Display: '1.43-inch AMOLED (466x466) 1000 nits Always-On',
        Sensors: 'Optical Heart Rate, ECG, SpO2, Skin Temp, Barometer',
        GPS: 'Dual-Band L1+L5 GNSS 5-satellite positioning',
        WaterResistance: '5ATM + IP68 (Swimming safe)',
        Battery: 'Up to 14 days normal use',
      }),
      tags: JSON.stringify(['smartwatch', 'wearable', 'gps', 'fitness', 'titanium', 'aura']),
    },
    {
      name: 'LuminaSmart RGBIC Ambient Gradient Lightstrip - 5M',
      slug: 'luminasmart-rgbic-ambient-gradient-lightstrip-5m',
      description: 'Matter-enabled smart LED light strip with segmented color control, music synchronization, HomeKit, Google Home, and Alexa compatibility.',
      categoryId: categoryMap['smart-devices'],
      brand: 'Lumina',
      price: 49.99,
      discountPercent: 20,
      rating: 4.6,
      reviewCount: 105,
      stock: 75,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Length: '5 Meters (16.4 ft) Cuttable & Extendable',
        LEDDensity: '60 LEDs per meter (RGBIC Individual ICs)',
        Connectivity: 'Wi-Fi 2.4GHz + Bluetooth 5.0 + Matter over Wi-Fi',
        Controls: 'App, Voice (Alexa / Google Assistant / Siri), Inline controller',
      }),
      tags: JSON.stringify(['smart home', 'lighting', 'rgb', 'matter', 'led strip', 'lumina']),
    },

    // Audio
    {
      name: 'AcousticPure SoundStage 5.1 Dolby Atmos Soundbar',
      slug: 'acousticpure-soundstage-dolby-atmos-soundbar',
      description: 'Immerse yourself in 3D cinematic audio with 11 discrete drivers, upward-firing height channels, 8-inch wireless subwoofer, eARC HDMI 2.1 passthrough, and AirPlay 2 support.',
      categoryId: categoryMap['audio'],
      brand: 'AcousticPure',
      price: 599.99,
      discountPercent: 15,
      rating: 4.8,
      reviewCount: 47,
      stock: 14,
      isFeatured: true,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Channels: '5.1.2 Surround Sound Configuration',
        TotalPower: '550 Watts Peak Power',
        AudioFormats: 'Dolby Atmos, Dolby TrueHD, DTS:X, LPCM',
        Connectivity: 'HDMI eARC, Optical, Bluetooth 5.3, Wi-Fi, AirPlay 2, Spotify Connect',
        Subwoofer: '8-inch Wireless Ported Bass Module',
      }),
      tags: JSON.stringify(['soundbar', 'dolby atmos', 'audio', 'home theater', 'speakers', 'acousticpure']),
    },
    {
      name: 'Sonus portable Hi-Fi Bluetooth Speaker',
      slug: 'sonus-portable-hifi-bluetooth-speaker',
      description: '360-degree room-filling acoustic sound in a rugged IP67 waterproof and dustproof cylinder. Features 24-hour battery life and True Wireless Stereo pairing.',
      categoryId: categoryMap['audio'],
      brand: 'AcousticPure',
      price: 129.99,
      discountPercent: 0,
      rating: 4.7,
      reviewCount: 82,
      stock: 48,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Acoustics: 'Dual 2.5" full-range drivers + dual passive radiators',
        Power: '40W RMS Output',
        Battery: '5200mAh (Up to 24 hours playback)',
        Protection: 'IP67 Waterproof & Dustproof (Floats on water)',
        Bluetooth: 'Bluetooth 5.3 with Multipoint connection',
      }),
      tags: JSON.stringify(['speaker', 'bluetooth speaker', 'portable', 'waterproof', 'audio']),
    },

    // Additional Products to ensure rich variety
    {
      name: 'ApexPro 14 Creator Laptop - RTX 4060',
      slug: 'apexpro-14-creator-laptop-rtx-4060',
      description: 'Designed for digital artists, 3D modellers, and mobile power users. Features Intel Core i7-14700H, RTX 4060 8GB, and 120Hz Calman-verified 3K display.',
      categoryId: categoryMap['laptops'],
      brand: 'ApexTech',
      price: 1699.99,
      discountPercent: 10,
      rating: 4.7,
      reviewCount: 24,
      stock: 17,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Processor: 'Intel Core i7-14700H',
        Graphics: 'NVIDIA GeForce RTX 4060 8GB',
        Memory: '32GB DDR5',
        Storage: '1TB NVMe SSD',
        Display: '14.5-inch 3K (3072x1920) 120Hz IPS 100% DCI-P3',
      }),
      tags: JSON.stringify(['laptop', 'creator', 'rtx 4060', 'intel i7', 'apexpro']),
    },
    {
      name: 'Nexus Horizon Fold 5G',
      slug: 'nexus-horizon-fold-5g',
      description: 'Ultra-thin foldable smartphone featuring a zero-crease 7.92-inch internal 120Hz OLED screen and 6.43-inch external cover screen with stylus support.',
      categoryId: categoryMap['smartphones'],
      brand: 'Nexus',
      price: 1799.0,
      discountPercent: 0,
      rating: 4.6,
      reviewCount: 19,
      stock: 9,
      isFeatured: true,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        MainDisplay: '7.92-inch Foldable OLED 120Hz LTPO',
        CoverDisplay: '6.43-inch OLED 120Hz',
        Processor: 'Snapdragon 8 Gen 3',
        RAM: '16GB',
        Storage: '512GB',
      }),
      tags: JSON.stringify(['smartphone', 'foldable', 'flagship', 'oled', 'nexus']),
    },
    {
      name: 'SpectraView 27-inch 240Hz Fast IPS Esports Monitor',
      slug: 'spectraview-27-240hz-esports-monitor',
      description: 'Competitive esports grade monitor with 2560x1440 QHD resolution, 240Hz refresh rate, 1ms GtG response time, and NVIDIA G-Sync compatibility.',
      categoryId: categoryMap['monitors'],
      brand: 'SpectraView',
      price: 379.99,
      discountPercent: 12,
      rating: 4.8,
      reviewCount: 68,
      stock: 24,
      isFeatured: false,
      isPromoted: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Size: '27 inches',
        Resolution: '2560 x 1440 QHD',
        RefreshRate: '240Hz',
        PanelType: 'Fast IPS with 1ms GtG',
        Sync: 'G-Sync Compatible & FreeSync Premium Pro',
      }),
      tags: JSON.stringify(['monitor', '240hz', 'gaming monitor', 'qhd', 'fast ips', 'spectraview']),
    },
    {
      name: 'Vanguard Stealth Pro Wireless Gaming Headset',
      slug: 'vanguard-stealth-pro-wireless-gaming-headset',
      description: 'Low-latency 2.4GHz wireless gaming headset with planar magnetic drivers, broadcast-quality detachable microphone, and dual hot-swappable battery system.',
      categoryId: categoryMap['headphones'],
      brand: 'Vanguard',
      price: 199.99,
      discountPercent: 10,
      rating: 4.7,
      reviewCount: 45,
      stock: 27,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Drivers: '50mm Planar Magnetic Drivers',
        Microphone: 'Supercardioid Noise-cancelling Mic',
        Battery: 'Dual Batteries (Up to 40 hours continuous)',
        Connectivity: '2.4GHz Wireless + Bluetooth 5.2 Simultaneous',
      }),
      tags: JSON.stringify(['headset', 'gaming headset', 'wireless', 'planar magnetic', 'vanguard']),
    },
    {
      name: 'Keycraft Horizon PBT Custom Keycap Set',
      slug: 'keycraft-horizon-pbt-keycap-set',
      description: 'Premium dye-sublimated PBT keycaps in gradient ocean dusk colorway. 142 keys with ANSI and ISO support.',
      categoryId: categoryMap['computer-accessories'],
      brand: 'Keycraft',
      price: 49.99,
      discountPercent: 0,
      rating: 4.9,
      reviewCount: 39,
      stock: 50,
      isFeatured: false,
      isPromoted: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
      ]),
      specifications: JSON.stringify({
        Material: 'Dye-Sublimated PBT (1.5mm wall thickness)',
        Profile: 'Cherry Profile',
        KeyCount: '142 Keys (Universal Compatibility)',
      }),
      tags: JSON.stringify(['keycaps', 'mechanical keyboard', 'pbt', 'keycraft', 'accessories']),
    },
  ];

  const createdProducts: Record<string, any> = {};
  for (const prod of productsData) {
    const created = await prisma.product.create({
      data: prod,
    });
    createdProducts[prod.slug] = created;

    // Create realistic reviews
    await prisma.review.create({
      data: {
        productId: created.id,
        userId: sarahUser.id,
        userName: 'Sarah Jenkins',
        rating: 5,
        comment: `Absolutely incredible product! The build quality and performance exceeded my expectations. Shipping was fast as well.`,
      },
    });

    await prisma.review.create({
      data: {
        productId: created.id,
        userId: demoUser.id,
        userName: 'Alex Rivera',
        rating: created.rating >= 4.7 ? 5 : 4,
        comment: `Works seamlessly in my daily setup. Highly recommended for anyone looking for reliable hardware.`,
      },
    });
  }

  // Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'TECH20',
        discountPercent: 20,
        maxDiscount: 200,
        minSpend: 100,
        isActive: true,
      },
      {
        code: 'SAVE10',
        discountPercent: 10,
        maxDiscount: 100,
        minSpend: 50,
        isActive: true,
      },
      {
        code: 'WELCOME15',
        discountPercent: 15,
        maxDiscount: 75,
        minSpend: 30,
        isActive: true,
      },
    ],
  });

  // Seed sample cart items for demo user
  const laptopProduct = createdProducts['apexpro-16-gaming-laptop-rtx-4080'];
  const mouseProduct = createdProducts['aeroglider-pro-ultralight-wireless-gaming-mouse'];
  const headphonesProduct = createdProducts['soundaura-anc-900-noise-cancelling-headphones'];
  const monitorProduct = createdProducts['spectraview-34-qd-oled-curved-gaming-monitor'];

  const demoCart = await prisma.cart.findUnique({ where: { userId: demoUser.id } });
  if (demoCart && laptopProduct && mouseProduct) {
    await prisma.cartItem.create({
      data: {
        cartId: demoCart.id,
        productId: laptopProduct.id,
        quantity: 1,
      },
    });
    await prisma.cartItem.create({
      data: {
        cartId: demoCart.id,
        productId: mouseProduct.id,
        quantity: 1,
      },
    });
  }

  // Seed sample wishlist items for demo user
  const demoWishlist = await prisma.wishlist.findUnique({ where: { userId: demoUser.id } });
  if (demoWishlist && monitorProduct && headphonesProduct) {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: demoWishlist.id,
        productId: monitorProduct.id,
      },
    });
    await prisma.wishlistItem.create({
      data: {
        wishlistId: demoWishlist.id,
        productId: headphonesProduct.id,
      },
    });
  }

  // Seed previous orders for demo user (one PROCESSING - cancellable, one DELIVERED - non-cancellable)
  if (laptopProduct && headphonesProduct) {
    // 1. Recent Processing Order (Cancellable)
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-882194',
        userId: demoUser.id,
        status: 'PROCESSING',
        subtotal: 349.99,
        discount: 35.0,
        shippingFee: 0,
        total: 314.99,
        shippingAddress: JSON.stringify({
          fullName: 'Alex Rivera',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          zipCode: '97477',
          country: 'United States',
          phone: '+1 (555) 234-5678',
        }),
        paymentMethod: 'DEMO_CARD',
        paymentStatus: 'COMPLETED',
        couponCode: 'SAVE10',
        items: {
          create: [
            {
              productId: headphonesProduct.id,
              productName: headphonesProduct.name,
              price: 349.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            },
          ],
        },
      },
    });

    // 2. Completed Delivered Order (Not Cancellable)
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-719302',
        userId: demoUser.id,
        status: 'DELIVERED',
        subtotal: 99.99,
        discount: 0,
        shippingFee: 15.0,
        total: 114.99,
        shippingAddress: JSON.stringify({
          fullName: 'Alex Rivera',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          zipCode: '97477',
          country: 'United States',
          phone: '+1 (555) 234-5678',
        }),
        paymentMethod: 'DEMO_CARD',
        paymentStatus: 'COMPLETED',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        items: {
          create: [
            {
              productId: mouseProduct.id,
              productName: mouseProduct.name,
              price: 99.99,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
            },
          ],
        },
      },
    });
  }

  console.log('Database seeded successfully with 25+ products, categories, demo users, orders, and coupons!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
