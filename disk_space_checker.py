import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import subprocess
import smtplib
threshold = 40
partition = "/"

def report_via_email():
    mail_content = "Sample content"
    #The mail addresses and password
    sender_address = 'operations@shoora.com'
    sender_pass = 'Vindal@123'
    receiver_address = 'avinashmishra1904@gmail.com'
    #Setup the MIME
    message = MIMEMultipart()
    message['From'] = sender_address
    message['To'] = receiver_address
    message['Subject'] = 'Disk Space has crossed the threshold.'   #The subject line
    session = smtplib.SMTP('smtp.gmail.com', 587) #use gmail with port
    session.starttls() #enable security
    session.login(sender_address, sender_pass) #login with mail_id and password
    text = message.as_string()
    session.sendmail(sender_address, receiver_address, text)
    session.quit()
    print('Mail Sent')


def check_once():
    df = subprocess.Popen(["df","-h"], stdout=subprocess.PIPE)
    for line in df.stdout:
        splitline = line.decode().split()
        if splitline[5] == partition:
            print(int(splitline[4][:-1]))
            if int(splitline[4][:-1]) > threshold:
                report_via_email()
check_once()