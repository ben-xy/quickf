package org.quickf.web;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;



/**
 * @author yanhailong
 *
 */
public class RequestTool {

    private final static String charset = "utf-8";

    private final static String enctype = "application/x-www-form-urlencoded";

//    public static JSONObject toJson(ConEntry entry){
//        JSONObject json = new JSONObject();
//        json.put("terminalId", entry.getTerminalId());
//        json.put("merchantId", entry.getMerchantId());
//        json.put("batchId", entry.getBatchId());
//        json.put("tradeTime", entry.getTradeTime());
//        json.put("cardNumber", entry.getCardNumber());
//        json.put("amount", entry.getAmount());
//        json.put("credentialId", entry.getCredentialId());
//        return json;
//    }

    /**
     * http请求
     * @param url 请求的url
     * @param params 参数
     * @return 请求返回的结果
     * @throws UnsupportedEncodingException
     * @throws IllegalStateException
     * @throws IOException
     */
    public static String httpExecute(String url, Map<String, String[]> params) throws UnsupportedEncodingException, IllegalStateException, IOException{
        if(url == null || url.length() < 1){
            return null;
        }
        int index = url.indexOf('?');
        String ext = null;
        if(index != -1){
            ext = url.substring(index + 1);
            url = url.substring(0, index);
        }
        HttpClient httpClient  = new DefaultHttpClient();
        HttpPost httpPost = new HttpPost(url);
        String t = buildParams(url, ext, params);
        System.out.println(t);
        StringEntity entity = new StringEntity(t, charset);
        entity.setContentType(enctype);
        httpPost.setEntity(entity);
        HttpResponse response = httpClient.execute(httpPost);
        HttpEntity httpEntity = response.getEntity();
        String content = new String(read(httpEntity.getContent()), charset);
        httpClient.getConnectionManager().shutdown();
        return content;
    }

    /**
     * 构造请求参数
     * @param url
     * @param params
     * @return
     * @throws UnsupportedEncodingException
     */
    private static String buildParams(String url, String ext, Map<String, String[]> params) throws UnsupportedEncodingException{
        StringBuilder builder = new StringBuilder();
        if(ext != null && ext.length() > 0){
            builder.append(ext);
        }
        if(params != null && params.size() > 0){
            Iterator<Map.Entry<String, String[]>> entries = params.entrySet().iterator();
            while(entries.hasNext()){
                Map.Entry<String, String[]> entry = entries.next();
                String key = entry.getKey();
                String[] values = entry.getValue();
                if(values != null && values.length > 0){
                    for (String value : values) {
                        if(value != null && value.length() > 0){
                            if(builder.length() > 0){
                                builder.append('&');
                            }
                            builder.append(key + "=" + URLEncoder.encode(value, charset));
                        }
                    }
                }
            }
        }
        return builder.toString();
    }

    /**
     * 读取数据
     * @param in
     * @return
     * @throws IOException
     */
    private static byte[] read(InputStream in) throws IOException{
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buff = new byte[512];
        int count = 0;
        while((count = in.read(buff)) != -1){
            out.write(buff, 0, count);
        }
        byte[] data = out.toByteArray();
        out.close();
        return data;
    }

    private static final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static Date getStartDate(String s){
        if(s == null || s.length() < 1){
            return null;
        }
        try {
            return format.parse(s + " 00:00:00");
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static Date getEndDate(String s){
        if(s == null || s.length() < 1){
            return null;
        }
        try {
            return format.parse(s + " 23:59:59");
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }
}
