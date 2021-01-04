 #!/bin/bash
 
 curl -X DELETE 'http://admin:admin@10.0.2.15:5984/testbudget'
curl -X PUT 'http://admin:admin@10.0.2.15:5984/testbudget'
curl -X POST -d @initialdata.json http://admin:admin@10.0.2.15:5984/testbudget/_bulk_docs -H "Content-Type: application/json"
