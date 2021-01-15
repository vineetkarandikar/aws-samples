
from pyspark.sql.functions import *
import pyspark.sql.functions as f
from pyspark.sql.types import IntegerType
from pyspark.sql.types import StructField, StructType ,StringType,FloatType,IntegerType
from pyspark.sql.functions import col, lit
#To avoid CRC and Success file creation
sc._jsc.hadoopConfiguration().set("mapreduce.fileoutputcommitter.marksuccessfuljobs", "false")
sc._jsc.hadoopConfiguration().set("parquet.enable.summary-metadata", "false")

spark.sql("set spark.sql.legacy.timeParserPolicy=LEGACY")


from pyspark.sql.functions import year, month, dayofmonth
super_market_sales_df = spark.read.option("inferSchema",True).option("header",True).csv("s3://medium-demo/super-market-sales/supermarket_sales - Sheet1.csv")

super_market_sales_df = super_market_sales_df.withColumn("Year", from_unixtime(unix_timestamp(super_market_sales_df.Date ,'MM/dd/yyyy'), 'yyyy')).withColumn("Month", from_unixtime(unix_timestamp(super_market_sales_df.Date ,'MM/dd/yyyy'), 'MM')).withColumn("Day", from_unixtime(unix_timestamp(super_market_sales_df.Date ,'MM/dd/yyyy'), 'dd'))
super_market_sales_df = super_market_sales_df.withColumnRenamed("Invoice ID", "InvoiceID")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Customer type", "CustomerType")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Product line", "ProductLine")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Unit price", "UnitPrice")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Tax 5%", "Tax5Percent")
super_market_sales_df = super_market_sales_df.withColumnRenamed("gross margin percentage", "grossMarginPercentage")
super_market_sales_df = super_market_sales_df.withColumnRenamed("gross income", "grossIncome")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Date", "SalesDt")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Time", "SalesTime")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Year", "year")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Month", "month")
super_market_sales_df = super_market_sales_df.withColumnRenamed("Day", "day")
super_market_sales_df.show(2)
super_market_sales_df.write.partitionBy("year","month").mode("overwrite").parquet("s3://medium-demo/super-market-sales-curated-zone/sales/")

