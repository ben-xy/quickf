package org.quickf.web;

import com.yjf.common.lang.util.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * @author xy 2014-07-29
 */

@Controller
@RequestMapping("quickf")
public class QuickfController{

	private static Logger logger = LoggerFactory.getLogger(QuickfController.class);

    //


    // /cashier/index.jsp?
    // signature=2f7fec6ddd533d3df7517083aa8b7ef7834ddc26
    // &echostr=8728099581641849598
    // &timestamp=1406613756
    // &nonce=1762721176
    private static final String REQUEST_GET = "GET";
    private static final String REQUEST_POST = "POST";

    @RequestMapping("shakeHand")
    public String shakeHand(HttpServletRequest request, HttpServletResponse response, Model model) {

        logger.info("Request method is [" + request.getMethod() + "]");
        if(REQUEST_GET.equals(request.getMethod()))
        {
            String signature = request.getParameter("signature");
            String echostr = request.getParameter("echostr");
            String timestamp = request.getParameter("timestamp");
            String nonce = request.getParameter("nonce");

            logger.info("Received the shake hand parameters[signature=" + signature + ",echostr=" + echostr + ",timestamp=" + timestamp + ",nonce=" + nonce + "]");

            model.addAttribute("echostr", echostr);

            try {
                response.getWriter().println(echostr);
            }catch(Exception e)
            {
                logger.error("Error on response writing",e);
            }
            return "/quickf/shakeOK.jsp";
        }else {
            try {
                BufferedReader br = new BufferedReader(new InputStreamReader((ServletInputStream)request.getInputStream()));
                String line = null;
                String content = "";
                while((line = br.readLine())!=null){
                    content += line;
                }

                logger.info("Received request content[" + content + "]");

                return processReq(content);

            } catch (IOException e) {
                logger.error("Error on get inputstream", e);
            }
        }

        return "../index.jsp";
	}

    @RequestMapping("createOrder")
    public String createOrder(HttpServletRequest request, HttpServletResponse response, Model model) {

        logger.info("Request method is [" + request.getMethod() + "]");

        return "createOrder.jsp";
	}


    /**
     * 用于处理各种用户请求
     * @param content 用户输入的内容
     */
    private String processReq(String content)
    {
        if(StringUtil.isBlank(content))
            return "index.jsp";

        if("1".equals(content))
        {
            return "quickf/createOrder.jsp";
        }

        return "index.jsp";
    }






}
