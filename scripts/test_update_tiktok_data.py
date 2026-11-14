import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from openpyxl import Workbook
import update_tiktok_data as sync

class ImportTests(unittest.TestCase):
 def workbook(self, header='Członkowie THE BOYZ'):
  wb=Workbook();ws=wb.active
  ws.append(['Data (YYMMDD)',header,'Link TikTok'])
  ws.append(['190106','Hyunjae, Hwall','https://www.tiktok.com/@istent_theboyz/video/6643290671404813570'])
  b=io.BytesIO();wb.save(b);return b.getvalue()
 def test_column_import_and_date(self):
  with tempfile.TemporaryDirectory() as d:
   out=Path(d)/'data.js'
   with patch.object(sync,'OUT',out), patch.object(sync.urllib.request,'urlopen',return_value=io.BytesIO(self.workbook())):
    sync.main()
   video=json.loads(out.read_text(encoding='utf-8').split('=',1)[1].strip().removesuffix(';'))['videos'][0]
   self.assertEqual(video['members'],['Hyunjae','Hwall'])
   self.assertEqual(video['date'],'2019-01-06')
 def test_missing_column_preserves_data(self):
  with tempfile.TemporaryDirectory() as d:
   out=Path(d)/'data.js';out.write_text('original')
   with patch.object(sync,'OUT',out), patch.object(sync.urllib.request,'urlopen',return_value=io.BytesIO(self.workbook('Other'))):
    with self.assertRaisesRegex(RuntimeError,'Missing'):
     sync.main()
   self.assertEqual(out.read_text(),'original')

if __name__=='__main__':unittest.main()
