from skimage import morphology,draw,color
from PIL import Image,ImageFilter,ImageEnhance,ImageOps
import numpy as np
import matplotlib.pyplot as plt
import pylab as pl
import os,glob

inputdir = "./red_cleanDog53_clean"
outdir = "./skeleton"
suffix = "*.jpg"

for imgpath in glob.glob(os.path.join(inputdir,suffix)):
    filepath, filename = os.path.split(imgpath)

    img = Image.open(imgpath)
    img = img.convert("1")
    img = img.point(lambda x: 1 if x==0 else 0)

    img = np.asarray(img)

    skeleton = morphology.skeletonize(img)

    fig,ax = plt.subplots()

    fig.tight_layout()
    skeleton=((1-skeleton)*255).astype('int32')
    print(skeleton)
    img = Image.fromarray(skeleton)
    img = img.convert('RGB')
    # img.show()
    img.save(os.path.join(outdir,filename),quality = 100)
# invimg = ImageOps.invert(img)
# print(np.asarray(invimg))
# ax.imshow(invimg, cmap=plt.cm.gray)
# plt.axis('off')
# plt.savefig('./sk.jpg')

# #img = Image.open('./sk.jpg')
# #img = img.convert("1")
# #img = img.point(lambda x: 1 if x==0 else 0)
# #imshow()
# plt.show()

