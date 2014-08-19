package com.yiji.quickf.test;



import java.io.IOException;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.jetty.security.HashLoginService;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.server.session.AbstractSessionManager;
import org.eclipse.jetty.util.thread.QueuedThreadPool;
import org.eclipse.jetty.webapp.WebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.yjf.common.lang.constants.SplitConstants;

/**
 * @author xuyin
 * @version $Id: EnterpriseJettyBootStrap.java,v 1.0 2012-8-21 下午3:19:16 xuyin Exp $
 */
public class QuickfJettyBootStrap {

	private static final String					PROJECT_NAME	= "quickf-assemble";

	private static final String					WEB_SRC			= PROJECT_NAME + "/src/main/webapp";

	private static Logger						logger			= LoggerFactory
																	.getLogger(QuickfJettyBootStrap.class);

	private static String						WEBAPP_PATH		= getWebPath();

	private final static int					port			= 80;


	//使用者
	private final static Map<String, String>	hostNameMapping	= new HashMap<String, String>();

	public QuickfJettyBootStrap() {
		hostNameMapping.put("WEBAPP_PATH", WEBAPP_PATH);
	}

	public static void main(String[] args) throws Exception {
		new QuickfJettyBootStrap();
		Server server = new Server();
		QueuedThreadPool threadPool = new QueuedThreadPool();
		threadPool.setMaxThreads(100);
		server.setThreadPool(threadPool);
		Connector connector = new SelectChannelConnector();
		connector.setPort(port); //端口
		server.addConnector(connector);
		WebAppContext context = new WebAppContext(WEBAPP_PATH, SplitConstants.SEPARATOR_CHAR_SLASH);
		context.getSecurityHandler().setLoginService(new HashLoginService("TEST-SECURITY-REALM")); 
		AbstractSessionManager sm = (AbstractSessionManager) context.getSessionHandler().getSessionManager();
		String defaultSessionCookie = sm.getSessionCookie();
		sm.setSessionCookie(defaultSessionCookie + port);
		HandlerCollection handlers = new HandlerCollection();
		handlers.setHandlers(new Handler[] { context, new DefaultHandler() });
		server.setHandler(handlers);

		server.setStopAtShutdown(true);
		server.setSendServerVersion(true);
		server.start();
		logger.info("启动完毕");
		server.join();

	}

	/**
	 *
	 * @param properties
	 * @return
	 */
	@SuppressWarnings("unused")
	private static String loadHostName() {
		try {
			InetAddress addr = InetAddress.getLocalHost();
			String hostname = addr.getHostName().toString();// 获得本机名称
			logger.info(hostname);
			return hostNameMapping.get(hostname);

		} catch (IOException e) {
			e.printStackTrace();
		}
		return "";
	}

	private static String getWebPath() {
		String currentClassPath = QuickfJettyBootStrap.class.getResource(
			SplitConstants.SEPARATOR_CHAR_SLASH).getPath();

		String webPath = currentClassPath.substring(0, currentClassPath.indexOf(PROJECT_NAME))
							+ WEB_SRC;
		System.out.println(webPath);
		return webPath;
	}
}
