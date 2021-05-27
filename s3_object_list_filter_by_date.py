import datetime
import boto3
session = boto3.Session(
    aws_access_key_id="#################",
    aws_secret_access_key="########################",
)
s3 = session.resource('s3')
bucket = s3.Bucket("mybucket")
for file in bucket.objects.filter(Prefix= "abs/bossdk/landing/"):
         #compare dates 
         if (file.last_modified).replace(tzinfo = None) > datetime.datetime(2021,5,26,tzinfo = None):
             #print results
             print('File Name: %s ---- Date: %s' % (file.key,file.last_modified))
             file_object = file.key
             file_name = str(file_object.split('/')[-1])
             print('Downloading file {} ...'.format(file_object))
             bucket.download_file(file_object, 'D:/bossdk/interested/go/to/hell/{}'.format(file_name))
