import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np
from tqdm import tqdm


class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(DoubleConv, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.conv(x)

class UNet(nn.Module):
    def __init__(self, in_channels=1, out_channels=1):
        super(UNet, self).__init__()
   
        self.down1 = DoubleConv(in_channels, 64)
        self.down2 = DoubleConv(64, 128)
        self.down3 = DoubleConv(128, 256)
        self.down4 = DoubleConv(256, 512)
        
        self.pool = nn.MaxPool2d(2)
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
        
        self.up1 = DoubleConv(512 + 256, 256)
        self.up2 = DoubleConv(256 + 128, 128)
        self.up3 = DoubleConv(128 + 64, 64)
        
        self.outc = nn.Conv2d(64, out_channels, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        d1 = self.down1(x)
        d2 = self.down2(self.pool(d1))
        d3 = self.down3(self.pool(d2))
        d4 = self.down4(self.pool(d3))
        
        x = self.up(d4)
        x = torch.cat([x, d3], dim=1)
        x = self.up1(x)
        
        x = self.up(x)
        x = torch.cat([x, d2], dim=1)
        x = self.up2(x)
        
        x = self.up(x)
        x = torch.cat([x, d1], dim=1)
        x = self.up3(x)
        
        out = self.sigmoid(self.outc(x))
        return out

class OilSpillDataset(Dataset):
    def __init__(self, image_dir, mask_dir, transform=None):
        self.image_dir = image_dir
        self.mask_dir = mask_dir
        self.transform = transform
        self.images = os.listdir(image_dir)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = os.path.join(self.image_dir, self.images[idx])
        mask_path = os.path.join(self.mask_dir, self.images[idx]) # Assuming mask has same filename
        
        image = Image.open(img_path).convert("L") # SAR intensity to Grayscale
        mask = Image.open(mask_path).convert("L")
        
        image = np.array(image, dtype=np.float32) / 255.0
        mask = np.array(mask, dtype=np.float32) / 255.0
        mask[mask > 0.5] = 1.0
        mask[mask <= 0.5] = 0.0
        
        if self.transform:
            image = self.transform(image)
            mask = self.transform(mask)
            
        return image, mask


def train_model():
    
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    BATCH_SIZE = 8
    LEARNING_RATE = 1e-4
    NUM_EPOCHS = 20
    IMAGE_DIR = "./data/train/images"
    MASK_DIR = "./data/train/masks"
    
    print(f"[INFO] Using device: {DEVICE}")
    print("[INFO] Initializing U-Net Model...")
    
    model = UNet(in_channels=1, out_channels=1).to(DEVICE)

    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((256, 256))
    ])
    
    print("[INFO] Loading Dataset...")
    try:
        train_dataset = OilSpillDataset(image_dir=IMAGE_DIR, mask_dir=MASK_DIR, transform=transform)
        train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
        print(f"[INFO] Found {len(train_dataset)} images for training.")
    except Exception as e:
        print(f"[WARNING] Could not load dataset at {IMAGE_DIR}. Please place Zenodo dataset files there.")
        print(f"[WARNING] Details: {e}")
        return

    print("[INFO] Starting Training...")
    for epoch in range(NUM_EPOCHS):
        model.train()
        epoch_loss = 0
        
        loop = tqdm(train_loader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS}")
        for data, targets in loop:
            data = data.to(DEVICE)
            targets = targets.to(DEVICE)
            
            # Forward
            predictions = model(data)
            loss = criterion(predictions, targets)
            
            # Backward
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            loop.set_postfix(loss=loss.item())
            
        print(f"Epoch [{epoch+1}/{NUM_EPOCHS}] Average Loss: {epoch_loss/len(train_loader):.4f}")
        
        # Save checkpoint
        torch.save(model.state_dict(), f"unet_oil_spill_epoch_{epoch+1}.pth")

    print("[INFO] Training Complete! Model saved as 'unet_oil_spill_final.pth'")
    torch.save(model.state_dict(), "unet_oil_spill_final.pth")

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs("./data/train/images", exist_ok=True)
    os.makedirs("./data/train/masks", exist_ok=True)
    print("===============================================")
    print(" OILTRACE AI - Sentinel-1 SAR Training Script")
    print("===============================================")
    print("Please extract your Zenodo dataset images and masks into ./data/train/...")
    train_model()
