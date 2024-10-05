import {Platform} from 'react-native';
import {processMediaFile} from '../../../utils/mediaProcessor';
import {storage} from '../../../firebase/config';

const uploadFile = async (file) => {
  const uri = file?.uri;
  const fallbackName = Platform.select({
    native: uri.substring(uri?.lastIndexOf('/') + 1),
    default: 'webdefaultbase24',
  });

  const fileData = Platform.select({
    web: {
      name: file?.name ?? file?.fileName ?? fallbackName,
      fileName: file?.name ?? file?.fileName ?? fallbackName,
      ...file,
      uri: file?.uri,
      type: 'image',
    },
    default: {
      ...file,
      name: file?.name ?? file?.fileName ?? fallbackName,
    },
  });

  const reference = storage.ref(fileData.name);
  const response = await fetch(fileData.uri);
  const blob = await response.blob();

  await reference.put(blob);
  const downloadURL = await reference.getDownloadURL();

  return downloadURL;
};

const processAndUploadMediaFile = (file) => {
  return new Promise((resolve, _reject) => {
    processMediaFile(file, ({processedUri, thumbnail}) => {
      uploadFile(file)
        .then((downloadURL) => {
          if (thumbnail) {
            uploadFile(thumbnail)
              .then((thumbnailURL) => {
                resolve({downloadURL, thumbnailURL});
              })
              .catch((e) => resolve({error: 'photoUploadFailed'}));

            return;
          }
          resolve({downloadURL});
        })
        .catch((e: any) => resolve({error: 'photoUploadFailed: ' + e.message}));
    });
  });
};

const uploadMedia = async (mediaAsset) => {
  try {
    const response: any = await processAndUploadMediaFile(mediaAsset);
    console.log('upload media response: ', response);
    return {
      downloadURL: response.downloadURL,
      thumbnailURL: response.thumbnailURL ?? response.downloadURL,
    };
  } catch (error) {
    console.log('error uploading media', error);
    return null;
  }
};

const firebaseStorage = {
  processAndUploadMediaFile,
  uploadMedia,
};

export default firebaseStorage;
