---
title: Reduced SSL expiry warnings
type: minor
---
This release reduces the number of emails sent about SSL certificate expiry warnings.  An influx of SSL warnings were recently sent due to a change from the Certificate Authority. Historically, CloudCannon has used HTTP validation to generate wildcard certificates for all connected domain names. Wildcard certificates can no longer be generated with HTTP validation due to [a decision by the Certificate Authority/Browser forum](https://cabforum.org/2021/06/03/ballot-sc45-wildcard-domain-validation/). The certificates which were previously generated using this method start to expire on September 1st 2022.

A number of emails were recently sent to add a TXT record to continue using a wildcard certificate. Since sending these emails we have concluded that only certificates on the apex (e.g. `example.com`) will need to add this record. A number of emails were sent for subdomain wildcard records (e.g. `www.example.com`) which should be ignored. If the TXT record is not added by the expiry date, we will fallback to a non-wildcard certificate to keep your site live and secure. We will be reaching out to individuals again with a follow up email. Reach out to support if you have any questions or concerns.

**Fixes:**

* Reduce emails sent for SSL certificate expiry warnings