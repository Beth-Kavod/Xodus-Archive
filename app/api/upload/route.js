import { NextResponse } from 'next/server'
import { uploadFileToDropbox, createNewDropboxFolder } from '@/utils/routeMethods'
import dotenv from 'dotenv'
dotenv.config()

export const POST = async (request) => {
  try {
    // Get a new dropbox token from the Dropbox API
    const getAllFormDataValues = (formData, key) => {
      const values = [];
      for (const [formDataKey, formDataValue] of formData.entries()) {
        if (formDataKey === key) {
          values.push(formDataValue);
        }
      }
      return values;
    };
  
    const formData = await request.formData()
    console.log(`All files: ${formData.getAll('file')}`)
    
    const files = getAllFormDataValues(formData, 'file');
    console.log(`All form files: ${files}`)

    const newFolderName = formData.get('email')
    const personalFolder = await createNewDropboxFolder(newFolderName)

    // Upload each file in parallel
    await Promise.all(files.map(async file => {
      await uploadFileToDropbox(file, personalFolder);
    }));

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      fileCount: formData.getAll('file').length,
    }, {
      status: 200
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ 
      success: false,
      errorMessage: `Error uploading files: ${error.message}`,
      error: error,
    }, {
      status: 500 
    })
  }
}
