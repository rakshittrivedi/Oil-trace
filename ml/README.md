# OILTRACE AI - Machine Learning Pipeline

This folder contains the Deep Learning pipeline for detecting oil spills using **Sentinel-1 SAR (Synthetic Aperture Radar)** satellite imagery.

## Model Overview
We use a **U-Net Architecture**, which is the industry standard for semantic segmentation tasks. The model takes a 1-channel grayscale SAR image as input and outputs a binary mask predicting the exact footprint of the oil spill.

## Dataset
This script is configured to train on the **Zenodo Sentinel-1 SAR Oil Spill Dataset**.

### Folder Structure Setup
Before running the training script, download the dataset and extract the images and ground-truth masks into the following directory structure:

```text
SIH26/
│
└── ml/
    ├── train_oil_spill_unet.py
    └── data/
        └── train/
            ├── images/    <-- Place SAR satellite images here (.jpg or .png)
            └── masks/     <-- Place Ground Truth binary masks here
```
*(Note: Ensure the mask filenames exactly match their corresponding image filenames).*

## Installation
Ensure you have Python installed, then install the required PyTorch and image processing dependencies:

```bash
pip install torch torchvision numpy Pillow tqdm
```

## Running the Training
Once your data is placed in the correct folders, simply run the script. It is configured to automatically use a CUDA GPU if available.

```bash
python train_oil_spill_unet.py
```

### Training Output
- The script will train for 20 epochs (you can adjust `NUM_EPOCHS` in the script).
- It prints the loss per epoch to show improvement.
- Checkpoints are saved automatically (`unet_oil_spill_epoch_X.pth`).
- The final trained weights are saved as **`unet_oil_spill_final.pth`**. These weights can then be loaded into the backend server for live inference!
